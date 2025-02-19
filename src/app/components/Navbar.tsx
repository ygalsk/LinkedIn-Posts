"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Profile", path: "/profile" },
    { name: "Social", path: "/social" },
    { name: "Blogs", path: "/blogs" },
  ];

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-center space-x-6">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <span
              className={`cursor-pointer px-4 py-2 rounded-md ${
                pathname === item.path
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
