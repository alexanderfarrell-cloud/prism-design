import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import ModusButton from "../components/ModusButton";

export default function NotFoundPage() {
  usePageTitle("Page Not Found");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <div className="text-6xl font-bold text-foreground-20">404</div>
      <div className="text-xl font-semibold text-foreground">
        Page not found
      </div>
      <div className="text-sm text-foreground-60 text-center max-w-md">
        The page you are looking for does not exist or has been moved.
      </div>
      <ModusButton
        color="primary"
        variant="filled"
        size="md"
        onButtonClick={() => navigate("/")}
      >
        Back to Dashboard
      </ModusButton>
    </div>
  );
}
