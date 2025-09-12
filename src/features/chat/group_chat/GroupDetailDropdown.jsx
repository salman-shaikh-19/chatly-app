import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faUsers, faX, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import ChatHeaderAction from "../components/ChatHeaderAction";
import CommonAvatar from "../../user/components/CommonAvatar";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// dayjs.extend(relativeTime); 
const GroupDetailDropdown = ({ groupUsers, allUsers, selectedChatUser, onlineUsers }) => {
    //group users, all users,selecte chat user,online users
    // console.log(groupUsers);

    const [openGroupDetail, setOpenGroupDetail] = useState(false);
    const groupDetailDropdownRef = useRef(null);
    const { loggedInUserData } = useSelector(state => state.common);
    // close dropdown when clicking outside or pressing esc key 
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                groupDetailDropdownRef.current &&
                !groupDetailDropdownRef.current.contains(e.target)
            ) {
                setOpenGroupDetail(false);
            }
        };
        const handleEsc = (e) => {
            if (e.key === "Escape") setOpenGroupDetail(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    const groupUserDetails = useMemo(() => {
        return groupUsers.map((gu) => {
            const user = allUsers.find((u) => u.id === gu.userId);
            return user
                ? { ...user, groupRole: gu.role, joinedAt: gu.joinedAt }
                : null;
        }).filter(Boolean); // remove nulls if any user not found
    }, [allUsers, groupUsers]);

    // console.log(onlineUsers);


    // console.log("groupUserDetails", groupUserDetails);
    const loggedInGroupUser = groupUserDetails.find(
        (gu) => gu.id === loggedInUserData.id
    );



    return (
        <div className="relative z-50" >
            <ChatHeaderAction
                onClick={() => setOpenGroupDetail((prev) => !prev)}
                icon={faUsers}
                aria-haspopup="true"
                aria-expanded={openGroupDetail}
                title="Group Members"
            />
            {/* <button
        onClick={() => setOpenGroupDetail((prev) => !prev)}
        title="More actions"
        aria-haspopup="true"
        aria-expanded={openGroupDetail}
        className="flex items-center select-none justify-center p-1  focus:outline-none hover:cursor-pointer"
      >
        <FontAwesomeIcon icon={faEllipsisV} className="text-gray-700  text-lg" />
      </button> */}

            {openGroupDetail && (
                <div

                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    {/* popup body  */}
                    <div ref={groupDetailDropdownRef} className="bg-white border rounded-lg shadow-lg m-2 p-1 w-86 relative max-w-md" >
                        {/* popup header  */}
                        <div className="flex items-center bg-teal-950 text-white rounded p-2">
                            <div className="bg-teal-700/50 border rounded-full object-contain mx-2 select-none pointer-events-none">
                                <CommonAvatar
                                    avatar={selectedChatUser?.avatar}
                                    avatarClassName="h-12 w-12  "
                                />
                            </div>
                            <div className="flex flex-col  p-1 mx-1 ">
                                <span className="font-bold mb-1 select-none">{selectedChatUser?.name}</span>
                                <span className="text-gray-400 select-none">{groupUsers.length || 0} memebers</span>
                            </div>
                            <div className="ms-auto mt-auto">
                                <button
                                    onClick={() => setOpenGroupDetail(false)}
                                    title="Close"
                                    className="absolute top-2 right-2 p-2 text-white hover:text-gray-400 hover:cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faX} />
                                </button>
                                <span
                                    title="Leave group"
                                    className="p-1 border rounded select-none cursor-pointer hover:bg-teal-600/50 hover:text-white">Leave</span>
                            </div>
                        </div>

                        {/* popup content body  */}
                        {/* <div className="flex justify-between">
                             <span className="text-gray-800 select-none">Created By:admin</span>
                              <span className="text-gray-800 select-none">Created at:12 sep 2024</span>
                           </div> */}
                        {/* <hr className="border border-gray-300" /> */}
                        <div className="overflow-y-auto max-h-72 p-2 pt-0 space-y-1">

                            {/* user card  */}
                            {
                                groupUserDetails.map((groupUser, index) =>
                                {
                                    const isGroupUserOnline=onlineUsers.includes(groupUser.id);
                                  return  (
                                    <>
                                        <div key={`group-user-${index}`} className="flex border-b p-2 border-gray-300">
                                            <div className="bg-white  rounded-full object-contain mx-2 select-none pointer-events-none">
                                                <CommonAvatar
                                                    avatar={groupUser?.avatar}
                                                    avatarClassName={`h-14 w-14  p-0.5 ${isGroupUserOnline ? 'bg-green-800' : 'bg-red-700'}`}
                                                />

                                            </div>

                                            <div className="flex flex-col  p-1 mx-1 ">
                                                <span className="font-bold mb-1 select-none">{groupUser?.id == loggedInUserData.id ? "You" : groupUser?.name}</span>
                                                <span className={`text-gray-400 select-none ${isGroupUserOnline ? 'text-green-800' : 'text-red-700'}`}>{isGroupUserOnline ? 'Online' : 'Offline'}</span>
                                            </div>
                                            <div className="ms-auto flex items-center">

                                                <span
                                                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm select-none
                                        ${groupUser.groupRole === "admin"
                                                            ? "bg-teal-700 text-white"
                                                            : "bg-blue-900 text-white"}`}
                                                >
                                                    {groupUser.groupRole === "admin" ? "Admin" : "Member"}
                                                </span>



                                                {
                                                    loggedInGroupUser?.groupRole === "admin" &&
                                                    groupUser.id !== loggedInUserData.id && (
                                                        <span
                                                            title={`Remove ${groupUser?.name}`}
                                                            className="p-0.5 flex items-center ms-0.5 border text-red-800 rounded select-none cursor-pointer hover:text-red-400"
                                                        >
                                                            <FontAwesomeIcon icon={faXmarkCircle} />
                                                        </span>
                                                    )
                                                }



                                            </div>

                                        </div>

                                    </>


                                )
                                }
                            )
                            }


                        </div>
                        {
                            loggedInGroupUser?.groupRole === "admin" && (
                                <>
                                    <div className="bg-gray-200/50 border-t border-gray-400 ">
                                        {/* <hr className="border border-gray-300" /> */}
                       

                                        <span className="text-gray-800 select-none font-semibold mx-1">Add Memeber:</span>
                                        <div className="flex justify-between p-1 gap-2">
                                            <select className="border border-gray-500 w-100 focus:border-gray-600 ring:border-gray-600 rounded-sm p-2">
                                                <option>Select user to add</option>
                                                {allUsers
                                                    .filter((user) => !groupUsers.some((gu) => gu.userId === user.id))
                                                    .map((user) => (
                                                        <option value={user.id} key={`select-user-${user.id}`}>
                                                            {user?.name || "Unknown"}
                                                        </option>
                                                    ))}
                                            </select>

                                            <span title="Add new member"
                                                className="flex items-center p-1 border rounded select-none cursor-pointer text-blue-800 hover:bg-blue-950 hover:text-white"
                                            >Add</span>
                                        </div>
                                    </div>
                                </>
                            )
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(GroupDetailDropdown);
