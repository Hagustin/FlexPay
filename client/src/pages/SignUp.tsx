import SignUp from '../components/signUp';

const SignupPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-10 items-center justify-center min-h-screen relative top-[-80px]">
      <div className=" flex flex-col gap-2.5 text-center items-center">
        <p className="font-inter text-gray-500 tracking-widest text-sm">
          Don’t Have An Account?
        </p>
        <p className="font-ivy text-5xl w-2/5 tracking-widest">
          Complete The Sign Up Process Below 🐄🐷🧑🏽‍🌾
        </p>
      </div>
      <SignUp />
    </div>
  );
};

export default SignupPage;
