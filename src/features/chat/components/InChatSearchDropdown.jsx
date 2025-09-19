import { faChevronDown, faChevronUp, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _, { set } from "lodash";
import Mark from "mark.js";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const InChatSearchDropdown = ({
    onClose, chatRef

}) => {
    const theme=useSelector(state=>state.common.theme);
    const modalRef = useRef();
    const inputRef = useRef();
    const [totalMatches, setTotalMatches] = useState(0);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const instance = new Mark(chatRef.current);
    const context = chatRef.current;

    useEffect(() => {
        inputRef.current?.focus();
        const handleEnter = (e) => {
            if (e.key === "Enter") {
                if (totalMatches === 0) return;
                // console.log('clicked',totalMatches);

                e.preventDefault();

                prevNextSearch("next");

            }
        };
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                instance.unmark();

                onClose();
            }
        };

        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                instance.unmark();
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        window.addEventListener("keydown", handleEnter);

        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("keydown", handleEscape);
            window.removeEventListener("keydown", handleEnter);
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose, totalMatches]);


    const handleSearch = _.debounce(() => {
        const searchTxt = inputRef.current.value;
        if (searchTxt.trim() === "") {
            setTotalMatches(0);
            setCurrentMatchIndex(0);
            instance.unmark();
            return;
        }
        // const context = chatRef.current;
        // if (!context) return;

        // const instance = new Mark(context);
        instance.unmark(); // remove old highlights

        if (searchTxt.trim() !== "") {
            instance.mark(searchTxt, {
                separateWordSearch: false,
                className: "bg-yellow-300",
                exclude: [".no-search-highlight"],//skip no-search-highlight class
                done: () => { // after marking is done
                    //  focus first match
                    const firstMark = context.querySelector("mark"); // get first mark
                    if (firstMark) {
                        firstMark.classList.add("current-highlight"); // add class to first mark
                        firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                    runSetTotalMatches();
                }
            });
        }
    }, 300);
    const runSetTotalMatches = () => {

        if (!context) return;
        const marks = context.querySelectorAll("mark");

        setTotalMatches(marks.length);

    }
    const prevNextSearch = (direction) => {

        if (!context) return;
        // const instance = new Mark(context);
        const marks = context.querySelectorAll("mark");
        if (marks.length === 0) return;
        // setTotalMatches(marks.length);
        let currentIndex = -1;
        marks.forEach((mark, index) => {
            if (mark.classList.contains("current-highlight")) {
                currentIndex = index;
                mark.classList.remove("current-highlight");
            }
        });

        if (direction === "next") {
            setCurrentMatchIndex((prev) => (prev + 1) % marks.length);
            currentIndex = (currentIndex + 1) % marks.length;
        } else if (direction === "prev") {
            setCurrentMatchIndex((prev) => (prev - 1 + marks.length) % marks.length);
            currentIndex = (currentIndex - 1 + marks.length) % marks.length;
        }

        marks[currentIndex].classList.add("current-highlight");
        marks[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    };
    return (
        <>



            {/* <div className="fixed top-20  left-1/2 z-50 flex items-center justify-center "> */}
            <div
                className="fixed top-20 left-1/2 -translate-x-1/2 
             z-50 flex items-center justify-center"
            >



                <div
                    ref={modalRef}
                    className="  rounded-lg   w-full max-w-md relative"
                >
                    <div className={`flex items-center  gap-2 relativen ${theme=='dark' ? 'bg-gray-900 text-gray-300':'bg-white'}`}>
                        <input ref={inputRef} type="text" onChange={handleSearch} placeholder="Search in chat..."
                            className="w-full  p-2 focus:outline-none focus:ring-0  " />
                        <div className="flex items-center  gap-1 ">

                            {
                                <span className={`text-sm ${theme=='dark'?'text-gray-100':'text-gray-500'} select-none`}>
                                    {totalMatches > 0 ? currentMatchIndex + 1 + "/" + totalMatches : "0/0"}
                                </span>
                            }
                            <span className={`partition-x-5 border-l ${theme=='dark'? 'border-gray-100':'border-gray-400'} h-5 mx-2`}>

                            </span>
                            <button
                                title="Previous"
                                disabled={totalMatches === 0} className={totalMatches == 0 ? "cursor-not-allowed " : "cursor-pointer"}>

                                <FontAwesomeIcon icon={faChevronUp} onClick={() => prevNextSearch("prev")} className={`${theme=='dark'?'text-gray-100 hover:bg-gray-700':'text-gray-400 hover:bg-gray-200'} p-2 hover:rounded-full  hover:p-2 `} />
                            </button >
                            <button
                                title="Next"
                                disabled={totalMatches === 0} className={totalMatches == 0 ? "cursor-not-allowed" : "cursor-pointer"}>
                                <FontAwesomeIcon icon={faChevronDown} onClick={() => prevNextSearch("next")} className={`${theme=='dark'?'text-gray-100 hover:bg-gray-700':'text-gray-400 hover:bg-gray-200'} p-2 hover:rounded-full  hover:p-2 `} />
                            </button>
                            <button
                                title="Close"
                                onClick={() => { instance.unmark(); onClose(); }} className={`${theme=='dark'?'text-gray-100 hover:bg-gray-700':'text-gray-400 hover:bg-gray-200'} p-2 hover:rounded-full  hover:p-2 cursor-pointer`}>
                                <FontAwesomeIcon icon={faX} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>




        </>

    )
};

export default React.memo(InChatSearchDropdown);
