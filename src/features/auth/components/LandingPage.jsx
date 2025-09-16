import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const LandingPage = ({onClick}) => {
    return (
        <div className="bg-teal-950/80 p-2 bg-teal-750 min-h-screen flex flex-col items-center justify-center text-center overflow-x-hidden  sm:space-y-6">
                        <div className="flex max-w-3xl bg-white rounded-2xl shadow-lg p-8 sm:flex-row flex-col gap-6 ">
                            <div className="text-6xl text-teal-600 mx-auto mb-4">
                                <FontAwesomeIcon icon={faCommentAlt} size="4x"  />
                                {/* <img src='ChatlLogoByGPT.png' alt='' className="h-100 w-100"/> */}
                            </div>
                            <div className="px-4 flex flex-col items-center justify-center select-none ">
                                <h1 className="text-teal-950 font-bold text-4xl">Welcome to Chatly!</h1>
                                <p className="my-4 text-gray-600 ">Connect, chat, and share moments with friends and communities in real-time. Your conversations, your way!</p>
                                <div className="flex gap-4 items-center ">
                              
                                    <span onClick={onClick} className=" text-white border bg-teal-950  px-6 py-2 rounded-lg shadow hover:bg-teal-800 hover:text-white hover:border-0 cursor-pointer transition" title="Get Started">
                                        Get Started
                                    </span>
                                   
                                </div>
                                {/* <div className="mt-10">
                                 <span className="text-gray-400 text-sm mt-6 select-none">
                                    Copyright &copy; 2025 Chatly. All rights reserved.
                                 </span>
                                  </div> */}
                            </div>
                        </div>
                    </div>
    );
}
export default React.memo(LandingPage);
