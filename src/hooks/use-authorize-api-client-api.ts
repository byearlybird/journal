import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { setTokenGetter, setSignedIn } from "../stores/api";

export function useAuthorizeAPIClient() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    setSignedIn(isSignedIn ?? false);
  }, [isSignedIn]);

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);
}
