import { Form, Formik } from "formik";
import CustomInputWithError from "../../../common/components/CustomInputWithError";
import CustomPasswordInputWithError from "../../../common/components/CustomPasswordInputWithError";
import * as Yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../authSlice";
import { toast } from "react-toastify";
import { fetchLoggedInUser, setGetStarted, setIsUserLoggedIn } from "../../../common/commonSlice";
import { CustomButtonAuth } from "../../../common/components/CustomButton";
import registerUI from '../../../assets/images/auth/registerUI.png'
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit, faUserLock } from "@fortawesome/free-solid-svg-icons";
import LandingPage from "./LandingPage";
const Regsiter = () => {
    const dispatch = useDispatch(); //use to dispatch action
    const { userLoading } = useSelector(state => state.auth);
    const { isGetStarted } = useSelector(state => state.common);
    const navigate = useNavigate();
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const userData = { email: values.userEmail, password: values.userPassword, name: values.userName, avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D" };
            const result = await dispatch(registerUser(userData));

            if (registerUser.fulfilled.match(result)) {
                toast.success("Account Created Successful");

                navigate("/login");
            } else if (registerUser.rejected.match(result)) {
                console.log('something went wrong');

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



                                <div className="w-full lg:w-1/2 flex items-center justify-center p-10">

                                    <Formik
                                        initialValues={{ userEmail: '', userPassword: '', userName: '' }}
                                        validationSchema={Yup.object({
                                            userEmail: Yup.string().email('Email address is invalid').required('Email is required'),
                                            userName: Yup.string().required('Username is required'),
                                            userPassword: Yup.string()
                                                .required("Password is required")
                                                .min(6, "Password must be at least 6 characters")
                                                .matches(
                                                    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                                                    "Password must include uppercase, lowercase, and number"
                                                ),
                                            //    avatarURL: Yup.string()
                                            //                 .url("Must be a valid URL")
                                            //                 .matches(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i, "Invalid image format")
                                            //                 .optional(),
                                        })}
                                        onSubmit={handleSubmit}
                                    >
                                        <Form>

                                            <h1 className="text-center text-3xl font-bold text-teal-800 mb-6 flex flex-col items-center gap-2">
                                                <FontAwesomeIcon
                                                    icon={faUserLock}
                                                    className="text-5xl text-teal-600 drop-shadow-sm"
                                                />
                                                <span>Create your account</span>
                                                <p className="text-sm text-gray-500 font-normal">
                                                    Join us and get started
                                                </p>
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
                                            {/* <CustomInputWithError
                                     inputId="avatarURL"
                                     inputName="avatarURL"
                                     inputLabelText="Profile Pic"
                                     inputPlaceHolder="eg. https://i.imgur.com/LDOO4Qs.jpg "
                                     inputType="url"
                                     isLabelEnabled={true}
                                     inputClassName="mb-3 "
                                 /> */}
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
                                                    btnClassName="w-full py-3 rounded-xl shadow-md mt-4"
                                                />
                                            </div>
                                            <div className="text-center mt-4">
                                                <p className="text-gray-600 text-sm">
                                                    Already have an account?{" "}
                                                    <Link
                                                        to="/login"
                                                        className="text-teal-600 font-semibold hover:underline"
                                                    >
                                                        Login
                                                    </Link>
                                                </p>
                                            </div>
                                        </Form>
                                    </Formik>
                                </div>


                                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-200 to-teal-100 items-center justify-center p-6">
                                    <img src={registerUI} alt="Login Illustration" className="rounded-xl select-none pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    )
            }
        </>
    )
}

export default Regsiter;
