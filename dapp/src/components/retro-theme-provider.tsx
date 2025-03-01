import React from "react";

export const RetroThemeProvider = ({
  children,
  enableCrtEffect = true,
}: {
  children: React.ReactNode;
  enableCrtEffect?: boolean;
}) => {
  return (
    <>
      <div className={enableCrtEffect ? "crt-effect" : ""}>
        {children}
        {enableCrtEffect && <div className="scanlines" />}
      </div>
    </>
  );
};

export default RetroThemeProvider;
