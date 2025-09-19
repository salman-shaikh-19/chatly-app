import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { CustomButton } from "../../../common/components/CustomButton";
import * as Yup from 'yup';
import CustomInputWithError from "../../../common/components/CustomInputWithError";
import { useSelector } from "react-redux";

const CreateGroupModal = ({ users, loggedInUserId, onClose, createGroupRef, handleCreateGroup }) => {
  // Store selected users with roles
  const [selectedGroupUsers, setSelectedGroupUsers] = useState({});
  const [groupType, setGroupType] = useState("public"); // default to public
  const theme=useSelector(state=>state.common.theme)

  // Close modal on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (createGroupRef.current && !createGroupRef.current.contains(e.target)) {
        onClose(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleUserSelection = (userId, checked) => {
    if (checked) {
      setSelectedGroupUsers((prev) => ({
        ...prev,
        [userId]: { role: "member" } // default role
      }));
    } else {
      setSelectedGroupUsers((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const handleRoleChange = (userId, role) => {
    setSelectedGroupUsers((prev) => ({
      ...prev,
      [userId]: { role }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={` ${theme=='dark'?'bg-gray-900 text-white':'bg-gray-100 '} border rounded-lg shadow-lg m-2 p-1 w-86 relative max-w-md`} ref={createGroupRef}>
        <button
          onClick={onClose}
          title="Close"
          className="absolute top-2 right-2 p-2  hover:text-gray-400 hover:cursor-pointer"
        >
          <FontAwesomeIcon icon={faX} />
        </button>

        <h3 className="text-lg  bg-teal-950 p-2 font-bold mb-3 rounded-t-lg">Create Group</h3>

        <div className="overflow-y-auto max-h-72 p-2 pt-0 space-y-1 hide-scrollbar">
          {users
            .filter((item) => item.id !== loggedInUserId)
            .map((user) => (
              <div key={user.id} className={`flex items-center justify-between gap-2 p-1 border-b border-gray-200 rounded ${theme=='dark'?'text-white  ':'text-black '}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!selectedGroupUsers[user.id]}
                    onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                    className="w-4 h-4 accent-teal-950 cursor-pointer"
                    id={`user-${user.id}`}
                  />
                  <label htmlFor={`user-${user.id}`} className=" font-medium cursor-pointer select-none">
                    {user?.name}
                  </label>
                </div>

                {selectedGroupUsers[user.id] && groupType!='public' && (
                  <select
                    value={selectedGroupUsers[user.id].role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`border rounded  px-2 py-1 text-sm cursor-pointer  ${theme=='dark' ? 'text-white bg-gray-900':'text-black'}`}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </div>
            ))}
        </div>

        <div className={`${theme=='dark' ? 'bg-gray-900':'bg-gray-100'} p-3 flex flex-col gap-2`}>
          <Formik
            initialValues={{ groupName: "" }}
            validationSchema={Yup.object({
              groupName: Yup.string()
                .max(45, "Group name should not exceed 45 characters")
                .required("Group name is required"),
            })}
            onSubmit={(values, { resetForm }) => {
              // Convert selectedGroupUsers object to array with roles
              const usersWithRoles = Object.entries(selectedGroupUsers).map(([id, data]) => ({
                id: Number(id),
                role: data.role
              }));

              handleCreateGroup({
                ...values,
                users: usersWithRoles,
                type: groupType,
              });

              resetForm();
              setSelectedGroupUsers({});
              setGroupType("public");
              onClose(false);
            }}
          >
            {({ handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
                {/* Radio buttons for group type */}
                <div className="flex items-center gap-4">
                  <label className={`${theme=='dark'?'text-white':'text-black'} flex items-center gap-1 cursor-pointer`}>
                    <input
                      type="radio"
                      name="groupType"
                      value="public"
                      checked={groupType === "public"}
                      onChange={() => setGroupType("public")}
                      className=""
                    />
                    Public
                  </label>
                  <label className={`flex items-center gap-1 cursor-pointer  ${theme=='dark'?'text-white':'text-black'}`}>
                    <input
                      type="radio"
                      name="groupType"
                      value="private"
                      checked={groupType === "private"}
                      onChange={() => setGroupType("private")}
                      className=""
                    />
                    Private
                  </label>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <CustomInputWithError
                      inputId="groupName"
                      inputName="groupName"
                      inputLabelText="Group Name:"
                      inputClassName={`m-0 p-0 ${theme=='dark' ? 'text-white':'text-black'}`}
                      labelClassName={` ${theme=='dark' ? 'text-white':'text-black'}`}
                      inputPlaceHolder="Enter group name"
                      inputType="text"
                      isLabelEnabled={true}
                    />
                  </div>

                  <CustomButton
                    btnId="createGroupBtn"
                    btnText={isSubmitting ? "Creating..." : "Create"}
                    btnType="submit"
                    btnClassName={`w-24 px-2 py-1 rounded bg-teal-900 text-white disabled:bg-teal-900/50`}
                    disabled={Object.keys(selectedGroupUsers).length === 0 || isSubmitting}
                  />
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreateGroupModal);
