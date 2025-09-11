import { Link } from 'react-router-dom';
import NoFound from '../../assets/images/fallback/404-img.png';

const NotFoundPage = () => {
    return (
        <div className="select-none h-screen flex flex-col items-center justify-center px-4 text-center">
            <img
                src={NoFound}
                alt="404 Not Found"
                className="w-full max-w-md md:max-w-lg lg:max-w-xl object-contain select-none pointer-events-none"
            />
            {/* <h1 className="text-2xl md:text-3xl font-bold mt-4">404 - Page Not Found</h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
            Sorry, the page you are looking for does not exist.
            </p> */}
            <Link to="/" className='bg-teal-700 w-50 mb-10 text-white px-4 py-2 rounded-2xl'>Go Back To Home Page</Link>
        </div>
    );
};

export default NotFoundPage;
