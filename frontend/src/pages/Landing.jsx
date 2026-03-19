import { Link } from "react-router-dom";
import Navbar from "./Navbar";


export default function Landing() {
    return (
        <div className="min-h-screen bg-[#FDF8FF]">

            {/* Navbar */}
            <Navbar />
            {/* Hero */}
            <div className="flex flex-col items-center justify-center text-center px-6 py-20">
                <img src="/Logo.png" alt="helper mascot" className="w-32 h-48 mb-6" />
                <h1 className="text-4xl font-medium text-[#6b46c1] mb-4">
                    Find help in your neighborhood
                </h1>

                <p className="text-[#9d7fe8] text-lg mb-8 max-w-md">
                    Post a task, set your price, and connect with helpful people nearby.
                </p>
                <div className="flex gap-4">
                    <Link to="/signup" className="bg-[#B197FC] text-white px-8 py-3 rounded-full font-medium hover:opacity-90">
                    Get started
                    </Link>
                    <Link to="/browse" className="bg-[#F9A8C9] text-[#9d3a6a] px-8 py-3 rounded-full font-medium hover:opacity-90">
                    Browse tasks
                    </Link>
                </div>
            </div>

            {/* How it works */}
            <div className="px-6 py-16 bg-white">
                <h2 className="text-2xl font-medium text-center text-[#6b46c1] mb-12">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#F5F3FF] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="text-lg font-medium text-[#6b46c1] mb-2">Post a task</h3>
                        <p className="text-gray-500 text-sm">Describe what you need help with and set a fair price</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#F5F3FF] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🤝</span>
                        </div>
                        <h3 className="text-lg font-medium text-[#6b46c1] mb-2">Get matched</h3>
                        <p className="text-gray-500 text-sm"> A neighbor agrees to help you out!</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#F5F3FF] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⭐️</span>
                        </div>
                    <h3 className="text-lg font-medium text-[#6b46c1] mb-2">Rate & Review</h3>
                    <p className="text-gray-500 text-sm">Leave a review and build trust in your community</p>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <footer className="bg-[#B197FC] text-white text-center py-6 text-sm">
            helper. -connecting neighbors, one task at a time.
            </footer>
        </div>
    )
}