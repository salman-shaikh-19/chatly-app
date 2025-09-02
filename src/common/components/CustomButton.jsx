import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const CustomButtonAuth=({btnText="button",isLogin=false,isDisable=false,btnId="id",btnName="name",btnClassName="",btnType = "submit"})=>{
return (
    <button disabled={isDisable} type={btnType} className={`px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-900 w-full ${btnClassName}`} id={btnId} name={btnName}>
       {isDisable ? (
        <>
          <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
       {
        isLogin ? "Logging In...":'Creating....'
       } 
        </>
      ) : (
        btnText
      )}
    </button>
)
}

const CustomButton=({btnText="button",btnId="id",btnName="name",btnClassName="",btnType = "button"})=>{
return (
    <button type={btnType} className={`  ${btnClassName}`} id={btnId} name={btnName}>
        {btnText}
    </button>
)
}

export  {CustomButtonAuth,CustomButton}