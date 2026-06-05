import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

function Container({ children, className = "" }: ContainerProps) {
  return <div className={`mx-auto max-w-full ${className}`}>{children}</div>;
}

export default Container;
