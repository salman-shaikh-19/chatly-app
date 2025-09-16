import { Form, Formik } from "formik";
import CustomInputWithError from "../../../common/components/CustomInputWithError";
import CustomPasswordInputWithError from "../../../common/components/CustomPasswordInputWithError";
import * as Yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { login } from "../authSlice";
import { toast } from "react-toastify";
import { fetchLoggedInUser, setGetStarted, setIsUserLoggedIn } from "../../../common/commonSlice";
import { CustomButtonAuth } from "../../../common/components/CustomButton";
import loginUI from '../../../assets/images/auth/loginUI.png'
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faUserLock } from "@fortawesome/free-solid-svg-icons";
import LandingPage from "./LandingPage";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch(); //use to dispatch action
    const { userLoading } = useSelector(state => state.auth);

    const { isGetStarted } = useSelector(state => state.common);
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
            {
                !isGetStarted ?
                    (
                        <LandingPage onClick={() => dispatch(setGetStarted(true))} />
                    )
                    :
                    (
                        <div className="flex items-center justify-center min-h-screen  bg-gradient-to-br from-gray-200 via-white to-gray-100 ">
                            <div className="flex w-full max-w-5xl mx-4 sm:mx-6 md:mx-8 lg:mx-0 my-6 
                rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">


                                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-200 to-teal-100 items-center justify-center p-8">
                                    <img src={loginUI} alt="Login Illustration"
                                        className="rounded-xl select-none pointer-events-none" />
                                </div>


                                <div className="w-full lg:w-1/2 flex items-center justify-center p-10 ">

                                    <Formik
                                        initialValues={{ userEmail: '', userPassword: '' }}
                                        validationSchema={Yup.object({
                                            userEmail: Yup.string().email('Email address is invalid').required('Email is required'),
                                            userPassword: Yup.string().required("Password is required")
                                        })}
                                        onSubmit={handleSubmit}
                                    >
                                        <Form className="space-y-5">

                                            <h1 className="text-center text-3xl font-bold text-teal-800 mb-6 flex flex-col items-center gap-2">
                                                <FontAwesomeIcon
                                                    icon={faUserLock}
                                                    className="text-5xl text-teal-600 drop-shadow-sm"
                                                />
                                                <span>Sign in to your account</span>
                                                <p className="text-sm text-gray-500 font-normal">
                                                    Login to continue
                                                </p>
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
                                                    btnClassName="w-full py-3 rounded-xl shadow-md mt-4"
                                                    isLogin={true}
                                                />
                                            </div>
                                            <div className="text-center mt-4">
                                                <p className="text-gray-600 text-sm">
                                                    Don't have an account?{" "}
                                                    <Link
                                                        to="/register"
                                                        className="text-teal-600 font-semibold hover:underline"
                                                    >
                                                        Create one
                                                    </Link>
                                                </p>
                                            </div>
                                        </Form>
                                    </Formik>
                                </div>
                            </div>
                        </div>
                    )

            }


        </>
    )
}

export default Login;
