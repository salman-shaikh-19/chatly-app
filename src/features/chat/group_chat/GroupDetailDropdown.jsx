
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
import ChatHeaderAction from "../components/ChatHeaderAction";
import { faUsers, faX, faXmarkCircle, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import CommonAvatar from "../../user/components/CommonAvatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { leaveGroup, removeUserFromGroup } from "../chatSlice";

const GroupDetailDropdown = ({ groupUsers, allUsers, selectedChatUser, onlineUsers, socket }) => {
    const [openGroupDetail, setOpenGroupDetail] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedNewUser, setSelectedNewUser] = useState(null);
    const groupDetailDropdownRef = useRef(null);
    const { loggedInUserData } = useSelector(state => state.common);
    const dispatch = useDispatch();
    // const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (groupDetailDropdownRef.current && !groupDetailDropdownRef.current.contains(e.target)) {
                setOpenGroupDetail(false);
            }
        };
        const handleEsc = (e) => e.key === "Escape" && setOpenGroupDetail(false);

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    const groupUserDetails = useMemo(() => {
        return groupUsers.map(gu => {
            const user = allUsers.find(u => u.id === gu.userId);
            const currentUser = groupUsers.find(u => u.userId === loggedInUserData.id);
            const isAdmin = currentUser?.groupRole === 'admin';
            return user ? { ...user, groupRole: gu.role, joinedAt: gu.joinedAt, isAdmin } : null;
        }).filter(Boolean);
    }, [allUsers, groupUsers]);

    const loggedInGroupUser = groupUserDetails.find(gu => gu.id === loggedInUserData.id);

    // Handle group update events from server
    // useEffect(() => {
    //     if (!socket) return;

    //     const handleGroupUpdate = (data) => {
    //         const { action, userId, groupId, groupName, removedById } = data;
            
    //         if (action === 'left' || action === 'removed') {
    //             // If current user was removed or left
    //             if (userId === loggedInUserData.id) {
    //                 dispatch(leaveGroup({ groupId }));
    //                 // onGroupLeft?.();
    //                 setOpenGroupDetail(false);
                    
    //                 // Show success message
    //                 const message = action === 'left' 
    //                     ? `You have left "${groupName || 'the group'}"` 
    //                     : `You have been removed from "${groupName || 'the group'}"`;
    //                 toast[action === 'left' ? 'success' : 'info'](message);
    //             } else {
    //                 // Other user left or was removed
    //                 dispatch(removeUserFromGroup({ groupId, userId }));
                    
    //                 // Show notification for group members
    //                 const user = allUsers.find(u => u.id === userId);
    //                 const remover = allUsers.find(u => u.id === removedById);
                    
    //                 if (user) {
    //                     const message = action === 'left'
    //                         ? `${user.name} has left "${groupName || 'the group'}"`
    //                         : `${remover?.name || 'Someone'} removed ${user.name} from "${groupName || 'the group'}"`;
    //                     toast.info(message);
    //                 }
    //             }
    //         }
    //     };

    //     socket.on('groupUpdate', handleGroupUpdate);

    //     return () => {
    //         socket.off('groupUpdate', handleGroupUpdate);
    //     };
    // }, [socket, dispatch, loggedInUserData.id, allUsers]);

    // remove user from group 
    const handleRemoveUser = useCallback(async (user) => {
        if (!socket || !selectedChatUser?.id || isProcessing) return;
        
        const result = await Swal.fire({
            title: `Remove ${user.name}?`,
            text: `Are you sure you want to remove ${user.name} from this group?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove user!',
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (result.isConfirmed) {
            setIsProcessing(true);
            try {
                socket.emit('removeGroupUser', {
                    groupId: selectedChatUser.id,
                    userId: user.id,
                    removedById: loggedInUserData.id,
                    groupName: selectedChatUser.name,
                    isAdmin: loggedInGroupUser?.groupRole === 'admin'
                });
            } catch (error) {
                console.error('Error removing user:', error);
                toast.error('Failed to remove user from group');
            } finally {
                setIsProcessing(false);
            }
        }
    }, [socket, selectedChatUser, loggedInUserData.id, loggedInGroupUser?.groupRole, isProcessing]);

    // leave from group
    const handleLeaveGroup = useCallback(async () => {
        if (!socket || !selectedChatUser?.id || isProcessing) return;
        
        const result = await Swal.fire({
            title: 'Leave Group?',
            text: `Are you sure you want to leave ${selectedChatUser.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, leave group!',
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (result.isConfirmed) {
            setIsProcessing(true);
            try {
                const isAdmin = loggedInGroupUser?.groupRole === 'admin';
                
                socket.emit('groupUpdate', {
                    groupId: selectedChatUser.id,
                    action: 'left',
                    userId: loggedInUserData.id,
                    removedById: loggedInUserData.id,
                    groupName: selectedChatUser.name,
                    isAdmin
                });
                
            } catch (error) {
                console.error('Error leaving group:', error);
                toast.error('Failed to leave group');
                setIsProcessing(false);
            }
        }
    }, [socket, selectedChatUser, loggedInUserData.id, loggedInGroupUser?.groupRole, isProcessing]);


const handleAddGroupMember = useCallback(async () => {
    if (!socket || !selectedChatUser?.id || !selectedNewUser || isProcessing) return;

    try {
        setIsProcessing(true);
        const newUser = allUsers.find(u => u.id === selectedNewUser);
        if (!newUser) {
            toast.error('Selected user not found');
            return;
        }

        const userExists = groupUsers.some(u => u.userId === selectedNewUser);
        if (userExists) {
            toast.info(`${newUser.name} is already in this group`);
            return;
        }

   
        socket.emit("addGroupUser", {
            groupId: selectedChatUser.id,
            newUser: { 
                userId: selectedNewUser, 
                role: "member",
                joinedAt: new Date().toISOString()
            },
            addedById: loggedInUserData.id,
            groupName: selectedChatUser.name,
            isAdmin: loggedInGroupUser?.groupRole === "admin"
        });
        toast.success(`${newUser.name} has been added to the group`);
        setSelectedNewUser(null);
    } catch (error) {
        console.error('Error adding user to group:', error);
        toast.error('Failed to add user to group');
    } finally {
        setIsProcessing(false);
    }
}, [socket, selectedChatUser, selectedNewUser, loggedInUserData.id, loggedInGroupUser?.groupRole, groupUsers, allUsers, isProcessing]);

    return (
        <div className="relative z-50">
            <ChatHeaderAction
             className="text-lg"
                onClick={() => setOpenGroupDetail(prev => !prev)}
                icon={faUsers}
                aria-haspopup="true"
                aria-expanded={openGroupDetail}
                title="Group Members"
            />

            {openGroupDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div ref={groupDetailDropdownRef} className="bg-white border rounded-lg shadow-lg m-2 p-1 w-86 relative max-w-md">

                        {/* Header */}
                        <div className="flex items-center bg-teal-950 text-white rounded p-2">
                            <CommonAvatar avatar={selectedChatUser?.avatar} avatarClassName="h-12 w-12 mx-2" />
                            <div className="flex flex-col p-1 mx-1">
                                <span className="font-bold mb-1  break-all">{selectedChatUser?.name}</span>
                                <span className="text-gray-400">{groupUsers.length} members</span>
                            </div>
                            <div className="ms-auto">
                                <button onClick={() => setOpenGroupDetail(false)} className="absolute top-2 right-2 text-white">
                                    <FontAwesomeIcon icon={faX} />
                                </button>
                                <span
                                    onClick={handleLeaveGroup}
                                    className="p-1 border rounded cursor-pointer hover:bg-teal-600/50 hover:text-white"
                                >Leave</span>
                            </div>
                        </div>

                     
                        <div className="overflow-y-auto max-h-72 p-2 pt-0 space-y-1">
                            {groupUserDetails.map((groupUser, index) => {
                                const isOnline = onlineUsers.includes(groupUser.id);
                                return (
                                    <div key={groupUser.id} className="flex border-b p-2 border-gray-300">
                                        <CommonAvatar
                                            avatar={groupUser.avatar}
                                            avatarClassName={`h-14 w-14 p-0.5 ${isOnline ? 'bg-green-800' : 'bg-red-700'}`}
                                        />
                                        <div className="flex flex-col p-1 mx-1">
                                            <span className="font-bold">{groupUser.id === loggedInUserData.id ? "You" : groupUser.name}</span>
                                            <span className={`text-gray-400 ${isOnline ? 'text-green-800' : 'text-red-700'}`}>
                                                {isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                        <div className="ms-auto flex items-center">
                                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm select-none
                                                ${groupUser.groupRole === "admin" ? "bg-teal-700 text-white" : "bg-blue-900 text-white"}`}>
                                                {groupUser.groupRole === "admin" ? "Admin" : "Member"}
                                            </span>

                                            {loggedInGroupUser?.groupRole === "admin" && groupUser.id !== loggedInUserData.id && (
                                                <span
                                                    onClick={() => handleRemoveUser(groupUser)}
                                                    className="p-0.5 flex items-center ms-0.5 border text-red-800 rounded cursor-pointer hover:text-red-400"
                                                      title={`Remove ${groupUser.name}`}
                                                >
                                                    <FontAwesomeIcon icon={faXmarkCircle} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                         {
                            loggedInGroupUser?.groupRole === "admin" && (
                                <>
                                    <div className="bg-gray-200/50 border-t border-gray-400 ">
                                        {/* <hr className="border border-gray-300" /> */}
                       

                                        <span className="text-gray-800 select-none font-semibold mx-1">Add Memeber:</span>
                                        <div className="flex justify-between p-1 gap-2">
                                            <select
                                                value={selectedNewUser || ""}
                                                onChange={(e) => setSelectedNewUser(Number(e.target.value))}
                                                className="border border-gray-500 w-100 focus:border-gray-600 ring:border-gray-600 rounded-sm p-2"
                                            >
                                                <option value="">Select user to add</option>
                                                {allUsers
                                                    .filter((user) => !groupUsers.some((gu) => Number(gu.userId) === Number(user.id)))
                                                    .map((user) => (
                                                        <option value={user.id} key={`select-user-${user.id}`}>
                                                            {user?.name || "Unknown"}
                                                        </option>
                                                    ))}
                                            </select>

                                            <span
                                                title="Add new member"
                                                onClick={handleAddGroupMember}
                                                className="flex items-center p-1 border rounded select-none cursor-pointer text-blue-800 hover:bg-blue-950 hover:text-white"
                                            >
                                                Add
                                            </span>

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
