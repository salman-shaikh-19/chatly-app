import { ErrorMessage, Field } from "formik";

const CustomInputWithError = ({
  inputLabelText = "Default label",
  inputType = "text",
  inputPlaceHolder = "Enter text",
  inputId,
  inputName,
  isLabelEnabled=false,
  inputClassName = "",
  errorComponent = "div",
  errorClassName = "text-red-500",
  labelClassName="text-slate-900"
}) => {
  return (
    <div className="mb-3">
      {
        isLabelEnabled && (
          <label htmlFor={inputId ?? inputName} className={` text-sm font-medium mb-2 block ${labelClassName}`}>{inputLabelText}</label>
        )
      }
      <Field
        type={inputType}
        placeholder={inputPlaceHolder}
        id={inputId ?? inputName}
        name={inputName ?? inputId}
       className={`w-full border-0 border-b-2 border-teal-500 focus:border-teal-600 focus:ring-0 outline-none ${inputClassName}`}
      />
      <ErrorMessage
        name={inputName ?? inputId}
        component={errorComponent}
        className={errorClassName}
      />
    </div>
  );
};

export default CustomInputWithError;
