
const colors = [
  "text-red-600",
  "text-green-600",
  "text-blue-600",
  "text-purple-600",
  "text-pink-600",
  "text-yellow-600",
  "text-indigo-600",
  "text-teal-600",
  "text-orange-600",
];

//same user has always same colour not changed
export default function getUserColor(userId) {
  if (!userId) return "text-gray-600";
  const index = Math.abs(hashCode(userId.toString())) % colors.length;
  return colors[index];
}

//simple has funs
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
