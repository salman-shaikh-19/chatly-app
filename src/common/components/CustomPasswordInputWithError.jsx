import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ErrorMessage, Field } from "formik";
import { useState } from "react";

const CustomPasswordInputWithError = ({
  inputLabelText = "Enter password",
  inputPlaceHolder = "",
  inputClassName = "",
  inputName,
  inputId,
  errorComponent = "div",
  errorClassName = "text-red-500"
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const id = inputId || inputName;

  return (
    <div className="mb-3">
      <label className="text-slate-900 text-sm font-medium mb-2 block" htmlFor={id}>
        {inputLabelText}
      </label>
      <div className="flex  rounded-lg ">
        <Field
          type={isPasswordVisible ? "text" : "password"}
          placeholder={inputPlaceHolder}
          name={inputName}
          id={id}
       className={`w-full border-0 border-b-2 border-teal-500 focus:border-teal-600 focus:ring-0 outline-none pr-40 ${inputClassName}`}
       />
        <button
          type="button"
       className="  text-teal-600"
          onClick={() => setPasswordVisible(!isPasswordVisible)}
        >
          <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
        </button>
      </div>
      <ErrorMessage
        name={inputName}
        component={errorComponent}
        className={`break-words max-w-sm  ${errorClassName}`}
      />
    </div>
  );
};

export default CustomPasswordInputWithError;
