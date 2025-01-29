import SignIn from '../components/signIn';

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-10 items-center justify-center min-h-screen relative top-[-130px]">
      <div className=" flex flex-col gap-2.5 text-center items-center">
        <p className="font-inter text-gray-500 tracking-widest text-sm">
          Simplifying secure payments
        </p>
        <p className="font-ivy text-5xl w-3/4 tracking-widest">
          The Future Of Rural Payments 🐄🐷🧑🏽‍🌾
        </p>
      </div>
      <SignIn />
    </div>
  );
};

export default LoginPage;
