"use client";
import { Button } from "@/components";
import { Dispatch, SetStateAction, useState } from "react";

interface Props {
  setIsAuthorized: Dispatch<SetStateAction<boolean>>;
}

const Login = ({ setIsAuthorized }: Props) => {
  const [password, setPassword] = useState<string>("");

  return (
    <section className="rounded-2xl border border-[#5c4a33] bg-[#140f0a] p-6">
      <h2 className="text-lg font-semibold text-[#f0e4cf]">GM Access</h2>
      <p className="mt-2 text-sm text-[#b7a387]">
        Enter the GM password to continue.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full max-w-xs rounded-lg border border-[#5c4a33] bg-[#19130d] px-3 py-2 text-sm text-[#f0e4cf]"
          placeholder="Password"
        />
        <Button onClick={() => setIsAuthorized(password === "1597Gm!@")}>
          Unlock
        </Button>
      </div>
    </section>
  );
};

export default Login;
