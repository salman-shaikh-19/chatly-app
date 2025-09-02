const getChatId = (user1, user2) => {
  return [user1, user2].sort().join("_"); // e.g. "1_3"
};

export { getChatId };