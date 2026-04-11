import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <button onClick={() => navigate("/login")}>
        Go to Login
      </button>
    </div>
  );
}