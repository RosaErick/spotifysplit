export const LoginForm = () => {
  return (
    <div className="flex-col justify-center items-center h-24">
      <div className="mb-4">
        <h1 className="block text-white text-sm font-bold mb-2 sm:text-2xl">
          Welcome to SpotStats
        </h1>
      </div>

      <div className="flex items-center justify-center">
        <button
          className="bg-green-800 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
          type="button"
        >
          <a
            href="http://localhost:3000/login"
            className="text-white font-bold py-2 px-2  focus:outline-none focus:shadow-outline "
          >
            Login with Spotify
          </a>
        </button>
      </div>
    </div>
  );
};
