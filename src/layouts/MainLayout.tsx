import Navbar from "../components/Navbar"

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        {children}
      </div>
    </>
  )
}

export default MainLayout