import { Form, Formik } from "formik";
import CustomInputWithError from "../../../common/components/CustomInputWithError";
import CustomPasswordInputWithError from "../../../common/components/CustomPasswordInputWithError";
import * as Yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { login } from "../authSlice";
import { toast } from "react-toastify";
import { fetchLoggedInUser, setIsUserLoggedIn } from "../../../common/commonSlice";
import { CustomButtonAuth } from "../../../common/components/CustomButton";
import loginUI from '../../../assets/images/auth/loginUI.png'
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserLock } from "@fortawesome/free-solid-svg-icons";
const Login = () => {
    const navigate=useNavigate();
    const dispatch = useDispatch(); //use to dispatch action
    const { userLoading } = useSelector(state => state.auth);
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const userData = { email: values.userEmail, password: values.userPassword };
            const result = await dispatch(login(userData));

            if (login.fulfilled.match(result)) {
                toast.success("Login Successful");
                const res = await dispatch(fetchLoggedInUser());
                dispatch(setIsUserLoggedIn(true));
                navigate("/");
            } else if (result.payload?.statusCode === 401) {
                toast.error("Invalid email or password");
            } else {
                toast.error(result?.payload || "Something went wrong");
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
                <div className="flex items-center  justify-center  p-6 sm:p-8 rounded-2xl bg-white-500 border border-gray-300 shadow-lg">


                    <div className=" w-1/2  flex hidden lg:block  items-center justify-center bg-gray-100 ">
                        <img src={loginUI} className="max-h-screen" />
                    </div>

                  
                   
                    <div className="mx-auto flex  items-center justify-center ">
                   
                        <Formik
                            initialValues={{ userEmail: '', userPassword: '' }}
                            validationSchema={Yup.object({
                                userEmail: Yup.string().email('Email address is invalid').required('Email is required'),
                                userPassword: Yup.string().required("Password is required")
                            })}
                            onSubmit={handleSubmit}
                        >
                            <Form>
                               
                                <h1 className="text-teal-800 text-center mb-10 text-lg">
                                    <FontAwesomeIcon
                                        icon={faUserLock}
                                        className="text-4xl sm:text-5xl lg:text-7xl"
                                    />
                                    Login
                                </h1>
                                <CustomInputWithError
                                    inputId="userEmail"
                                    inputName="userEmail"
                                    inputLabelText="Email"
                                    inputPlaceHolder="Enter registered email"
                                    inputType="email"
                                    isLabelEnabled={true}
                                    inputClassName="mb-4 "
                                />
                                <CustomPasswordInputWithError
                                    inputId="userPassword"
                                    inputName="userPassword"
                                    inputLabelText="Password"
                                    inputPlaceHolder="Enter your password"
                                    // inputClassName="mb-3"
                                />
                                <div className="mb-3">
                                    <CustomButtonAuth
                                        btnText="Login"
                                        isDisable={userLoading}
                                        btnClassName="mt-6"
                                        isLogin={true}
                                    />
                                </div>
                            <div className="text-center">
                                <Link to="/register" className="text-teal-600 hover:text-teal-900">Create new account</Link>
                            </div>
                            </Form>
                        </Formik>
                     </div> 
                </div>
            </div>
        </>
    )
}

export default Login;