import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";

export default function ToastWrapper() {
  const theme = useSelector((state) => state.common.theme);

  return (
    <ToastContainer
      newestOnTop={true}
            closeOnClick={true}  
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
      theme={theme === "dark" ? "dark" : "light"}
    />
  );
}
