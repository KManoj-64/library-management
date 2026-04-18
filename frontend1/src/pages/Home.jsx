import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bell, Shield, BarChart3, Clock, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  {
    title: 'Book Management',
    description: 'Organize catalogs, availability, and metadata in one clean workspace.',
    icon: BookOpen
  },
  {
    title: 'Issue and Return System',
    description: 'Track borrowing cycles with real-time status updates and due dates.',
    icon: Clock
  },
  {
    title: 'Email Notifications',
    description: 'Send OTP verification, reminders, and updates automatically.',
    icon: Bell
  },
  {
    title: 'Fine Tracking',
    description: 'Monitor late fees with clear summaries for students and admins.',
    icon: BarChart3
  },
  {
    title: 'Admin Dashboard',
    description: 'See activity, trends, and inventory health at a glance.',
    icon: Shield
  }
];

const steps = [
  {
    title: 'Register',
    description: 'Create a student account in minutes with secure data storage.',
    icon: Shield
  },
  {
    title: 'Verify Email',
    description: 'Confirm access instantly with OTP verification.',
    icon: CheckCircle
  },
  {
    title: 'Borrow Books',
    description: 'Browse, request, and issue books through a smooth workflow.',
    icon: BookOpen
  },
  {
    title: 'Return or Renew',
    description: 'Close the loop with returns, renewals, and fine tracking.',
    icon: Clock
  }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Navbar />

      <main className="relative overflow-hidden">
        {/* Decorative Gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.15),_transparent_45%)]"
        />

        {/* Hero Section */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-16 pt-20 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/50 px-3 py-1 text-sm font-semibold tracking-wide text-indigo-600 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              Modern Campus Operations
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl text-balance">
              Smart Library <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Streamline library workflows with organized inventory, automated
              notifications, and a seamless visual experience for students and
              admins alike.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center rounded-full border-2 border-gray-200 bg-white/50 backdrop-blur px-8 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-white hover:text-gray-900 hover:scale-[1.02]"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Hero Bento Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:w-[480px]">
            <div className="group animate-fade-up rounded-2xl border border-gray-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-indigo-200 hover:shadow-xl hover:bg-white [animation-delay:120ms]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-indigo-100">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Inventory</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">1,250+</h3>
              <p className="mt-1 text-sm text-gray-600">Books tracked with availability insights.</p>
            </div>
            <div className="group animate-fade-up rounded-2xl border border-gray-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-purple-200 hover:shadow-xl hover:bg-white [animation-delay:220ms]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-100">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Automation</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">Always On</h3>
              <p className="mt-1 text-sm text-gray-600">Smart OTP + due date reminders.</p>
            </div>
            <div className="group animate-fade-up rounded-2xl border border-gray-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-rose-200 hover:shadow-xl hover:bg-white [animation-delay:320ms]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-rose-100">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Operations</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">Role Based</h3>
              <p className="mt-1 text-sm text-gray-600">Secure admin and student contexts.</p>
            </div>
            <div className="group animate-fade-up rounded-2xl border border-gray-200/80 bg-white/60 backdrop-blur-sm p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-emerald-200 hover:shadow-xl hover:bg-white [animation-delay:420ms]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                <BarChart3 className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Insights</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">Live Data</h3>
              <p className="mt-1 text-sm text-gray-600">Real-time overview of library health.</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="animate-fade-up rounded-[2.5rem] border border-gray-200 bg-white/60 backdrop-blur-xl p-8 sm:p-12 shadow-xl [animation-delay:120ms]">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Features built from the ground up</h2>
              <p className="mt-4 text-lg text-gray-600 box-content">
                Everything needed to run a modern library with clear workflows and
                dependable automation.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden"
                  >
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-[0.03] transition-transform duration-500 group-hover:scale-150"></div>
                    <Icon className="h-8 w-8 text-indigo-500 mb-4 transition-transform duration-300 group-hover:-translate-y-1" />
                    <h3 className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="animate-fade-up text-center mb-16 [animation-delay:120ms]">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">How it works</h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-600">
              A focused flow that takes students from registration to returns
              without confusion.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-[3.25rem] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-gray-200 via-indigo-200 to-gray-200 z-0"></div>
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative z-10 animate-fade-up rounded-2xl border border-gray-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:scale-[1.02]"
                  style={{ animationDelay: `${160 + index * 80}ms` }}
                >
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 ring-4 ring-white shadow-inner transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                      Step 0{index + 1}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-gray-900">LMS Admin</span>
          </div>
          <span>&copy; {new Date().getFullYear()} LMS. Built for smarter campus libraries.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
