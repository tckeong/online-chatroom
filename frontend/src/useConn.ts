import { useContext } from "react";
import { ConnContext } from "./connContext";

export const useConn = () => useContext(ConnContext);
