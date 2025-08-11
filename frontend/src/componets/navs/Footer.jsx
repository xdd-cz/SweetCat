import React from "react";

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: "#2c2c2c",
      color: "#f5f5f5",
      textAlign: "center",
      padding: "20px 10px",
      fontFamily: "'Comic Sans MS', cursive, sans-serif",
      fontSize: "16px",
      marginTop: "auto"
    }}>
      <p style={{ margin: 0 }}>
        SweetCat The Purrfect Place for Cat Lovers!<br />
        Upload your cutest cats and share the love! &copy; {new Date().getFullYear()}
      </p>
      <small style={{ fontSize: "12px", color: "#ccc" }}>
        Made with love for feline fanatics everywhere.
      </small>
    </footer>
  );
};

export default Footer;
