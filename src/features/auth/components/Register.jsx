import { Form, Formik } from "formik";
import CustomInputWithError from "../../../common/components/CustomInputWithError";
import CustomPasswordInputWithError from "../../../common/components/CustomPasswordInputWithError";
import * as Yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../authSlice";
import { toast } from "react-toastify";
import { fetchLoggedInUser, setIsUserLoggedIn } from "../../../common/commonSlice";
import { CustomButtonAuth } from "../../../common/components/CustomButton";
import registerUI from '../../../assets/images/auth/registerUI.png'
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit, faUserLock } from "@fortawesome/free-solid-svg-icons";
const Regsiter = () => {
    const dispatch = useDispatch(); //use to dispatch action
    const { userLoading } = useSelector(state => state.auth);
    const navigate=useNavigate();
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const userData = { email: values.userEmail, password: values.userPassword,name:values.userName,avatar:values.avatarURL };
            const result = await dispatch(registerUser(userData));

            if (registerUser.fulfilled.match(result)) {
                toast.success("Account Created Successful");

                navigate("/login");
            } else if (registerUser.rejected.match(result)) {
                toast.error(result.payload || 'Something went wrong');
            } else {
                toast.warning(result.payload || 'Error');

            }
            

        } catch (err) {
            // toast.error("Unexpected error occurred");
            console.log(err);

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div class="flex items-center  justify-center  p-6 sm:p-8 rounded-2xl bg-white-500 border border-gray-300 shadow-lg">



                  
                   
                    <div className="mx-auto flex  items-center justify-center ">
                   
                        <Formik
                            initialValues={{ userEmail: '', userPassword: '',userName:'',avatarURL:'' }}
                            validationSchema={Yup.object({
                                userEmail: Yup.string().email('Email address is invalid').required('Email is required'),
                                userName:Yup.string().required('Username is required'),
                                userPassword: Yup.string().required("Password is required")
                                .min(6, "Password must be at least 6 characters")
                                .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/,"Password must be at least 6 characters, with at least one uppercase, lowercase, and number"),
                                avatarURL:Yup.string()
                                .url("Must be a valid URL")
                                .matches(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i, "Must be a valid image format like (jpg, png, etc.)")
                                .required("Profile picture URL is required"),
                            })}
                            onSubmit={handleSubmit}
                        >
                            <Form>
                               
                                <h1 className="text-teal-800 text-center mb-10 text-lg">
                                    <FontAwesomeIcon
                                        icon={faUserEdit}
                                        className="text-4xl sm:text-5xl lg:text-7xl"
                                    />
                                    Login
                                </h1>
                                  <CustomInputWithError
                                    inputId="userName"
                                    inputName="userName"
                                    inputLabelText="Username"
                                    inputPlaceHolder="Enter username "
                                    inputType="text"
                                    isLabelEnabled={true}
                                    inputClassName="mb-3 "
                                />
                                <CustomInputWithError
                                    inputId="userEmail"
                                    inputName="userEmail"
                                    inputLabelText="Email"
                                    inputPlaceHolder="Enter email"
                                    inputType="email"
                                    isLabelEnabled={true}
                                    inputClassName="mb-3 "
                                />
                                    <CustomInputWithError
                                     inputId="avatarURL"
                                     inputName="avatarURL"
                                     inputLabelText="Profile Pic"
                                     inputPlaceHolder="eg. https://i.imgur.com/LDOO4Qs.jpg "
                                     inputType="url"
                                     isLabelEnabled={true}
                                     inputClassName="mb-3 "
                                 />
                                <CustomPasswordInputWithError
                                    inputId="userPassword"
                                    inputName="userPassword"
                                    inputLabelText="Password"
                                    inputPlaceHolder="Enter password"
                                    // inputClassName="mb-3"
                                />
                                <div className="mb-3">
                                    <CustomButtonAuth
                                        btnText="Register"
                                        isDisable={userLoading}
                                        btnClassName="mt-4"
                                    />
                                </div>
                            <div className="text-center">
                                <Link to="/login" className="text-teal-600 hover:text-teal-900">Already have an account?</Link>
                            </div>
                            </Form>
                        </Formik>
                     </div> 

                    <div className=" w-1/2 flex hidden lg:block  items-center justify-center bg-gray-100 ">
                        <img src={registerUI} className="max-h-screen" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Regsiter;