import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Formik } from "formik";
import React,  {useEffect, useState } from "react";
import { CustomButton } from "../../../common/components/CustomButton";
import * as Yup from 'yup';
import CustomInputWithError from "../../../common/components/CustomInputWithError";
const CreateGroupModal=({users, loggedInUserId, onClose,createGroupRef,handleCreateGroup })=>{
    const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);

    //close create group model on outside click
   useEffect(() => {
           const handleClick = (e) => {
             if (createGroupRef.current && !createGroupRef.current.contains(e.target)) {
               onClose(false);
             }
           };
          document.addEventListener("mousedown", handleClick);

          //clear when compoennt unmount
        return () => document.removeEventListener("mousedown", handleClick);
    }, [onClose]);
    return (
          <div className="fixed inset-0  z-50 flex items-center justify-center bg-opacity-70" >
                      <div className="bg-white  border rounded-lg shadow-lg m-2  p-1 w-86 relative" ref={createGroupRef}>
                        <button
                          onClick={onClose}
                          title="Close"
                          className="absolute top-2 right-2 p-2 text-white hover:text-gray-400 hover:cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faX} />
                        </button>
                           
                        <h3 className="text-lg text-white bg-teal-950 p-2 font-bold mb-3">Create Group</h3>
                      <div className="overflow-y-auto h-70 p-2 pt-0  ">
                   

                       {users
                      .filter((item) => item.id !== loggedInUserId)
                      .map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 mt-1  ">
                          <input type="checkbox"
                            onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGroupUsers((prev) => [...prev, user.id]);
                            } else {
                              setSelectedGroupUsers((prev) => prev.filter((id) => id !== user.id));
                            }
                          }}
                          className="w-4 h-4  rounded-sm accent-teal-950 hover:cursor-pointer" id={`user-${user.id}`} />
                          <label htmlFor={`user-${user.id}`} className="text-gray-800 font-medium hover:text-teal-900 cursor-pointer select-none ">{user?.name}</label>
                        </div>
                      ))
                    }
                    </div>
             <div className="bg-gray-300/50 p-2 flex">
          <Formik
            initialValues={{ groupName: "" }}
            validationSchema={Yup.object({
              groupName: Yup.string()
                .max(45, "Group name should not up to  45 characters")
                .required("Group name is required"),
            })}
            onSubmit={(values, { resetForm }) => {
              handleCreateGroup({
                ...values,
                users: selectedGroupUsers,
              });
              resetForm();
              setSelectedGroupUsers([]);
              onClose(false);
            }}
          >
            {({ handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full">
                <div className="flex-1">
                  <CustomInputWithError
                    inputId="groupName"
                    inputName="groupName"
                    inputLabelText="Group Name:"
                    inputClassName="m-0 p-0 text-black"
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
                  disabled={selectedGroupUsers.length === 0 || isSubmitting}
                />
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};


export default React.memo(CreateGroupModal)
