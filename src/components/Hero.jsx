import React from 'react';

const Hero = () => {
  return (
    <section className="bg-indigo-700 py-20 mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            Find Your Dream Job
          </h1>
          <p className="my-4 text-xl text-white">
            Connect talented developers with amazing companies
          </p>
          <div className="mt-8">
            <a
              href="#jobs"
              className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Jobs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;