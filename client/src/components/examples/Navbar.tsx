import Navbar from "../Navbar";

export default function NavbarExample() {
  return <Navbar onMenuClick={() => console.log("Menu clicked")} />;
}
