 const resolveName = (userId,allUsers) => {
    const user = allUsers?.find(u => u.id === userId);
    return user ? user.name : "Unknown";
  };

  export default resolveName
