
const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">DOST-CSF</h1>
          <nav className="space-x-4">
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Our Site</h2>
          <p className="text-gray-600 text-lg max-w-lg mx-auto mb-8">
            This is a simple landing page to test Tailwind CSS functionality.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Get Started
          </button>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">★</div>
              <h3 className="text-xl font-semibold mb-2">Feature One</h3>
              <p className="text-gray-600">A simple description to show text styling with Tailwind.</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">♦</div>
              <h3 className="text-xl font-semibold mb-2">Feature Two</h3>
              <p className="text-gray-600">Testing different utility classes from Tailwind CSS.</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">◉</div>
              <h3 className="text-xl font-semibold mb-2">Feature Three</h3>
              <p className="text-gray-600">Simple components to verify Tailwind is working.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-6 mt-auto">
        <div className="container mx-auto text-center">
          <p>© 2025 DOST-CSF. Testing Tailwind CSS.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="hover:text-blue-300">Twitter</a>
            <a href="#" className="hover:text-blue-300">Facebook</a>
            <a href="#" className="hover:text-blue-300">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App