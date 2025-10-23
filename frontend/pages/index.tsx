import Layout from '@/components/Layout';
import EventCard from '@/components/EventCard';
import MemberCard from '@/components/MemberCard';
import { eventApi, memberApi, projectApi } from '@/lib/api';
import { Event, Member } from '@/lib/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquarePlus, Users, Code, Calendar } from 'lucide-react';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [leads, setLeads] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Live stats
  const [stats, setStats] = useState({
    members: 0,
    projects: 0,
    events: 0,
  });
  const [animatedStats, setAnimatedStats] = useState({
    members: 0,
    projects: 0,
    events: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsRes, membersRes, projectsRes, allEventsRes] = await Promise.all([
          eventApi.getAll({ featuredOnly: true }).catch(err => {
            console.error('Featured Events API error:', err);
            return { data: [] };
          }),
          memberApi.getAll({ approvedOnly: true }).catch(err => {
            console.error('Members API error:', err);
            return { data: [] };
          }),
          projectApi.getAll({ approvedOnly: true }).catch(err => {
            console.error('Projects API error:', err);
            return { data: [] };
          }),
          eventApi.getAll().catch(err => {
            console.error('All Events API error:', err);
            return { data: [] };
          }),
        ]);

        setFeaturedEvents(eventsRes.data?.slice(0, 3) || []);
        setLeads(membersRes.data?.filter((m: Member) => m.user.isLead).slice(0, 4) || []);
        
        // Set real stats
        setStats({
          members: membersRes.data?.length || 0,
          projects: projectsRes.data?.length || 0,
          events: allEventsRes.data?.length || 0,
        });
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Animate stats counting up
  useEffect(() => {
    if (stats.members === 0 && stats.projects === 0 && stats.events === 0) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        members: Math.floor(stats.members * progress),
        projects: Math.floor(stats.projects * progress),
        events: Math.floor(stats.events * progress),
      });

      if (currentStep >= steps) {
        setAnimatedStats(stats);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="container-custom py-24 text-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="mb-6 inline-block animate-bounce-slow">
          <span className="badge-primary flex items-center gap-2">
            <MessageSquarePlus size={16} />
            Welcome to CodeClub
          </span>
        </div>
        <h1 className="section-title mb-4 animate-fade-in">
          Build Together, Create Amazing
        </h1>
        <p className="section-subtitle max-w-2xl mx-auto animate-fade-in-delay">
          A community of passionate developers collaborating on innovative projects, sharing knowledge, and growing together.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in-delay-2">
          <Link href="/members" className="btn-primary group">
            <Users size={20} className="group-hover:scale-110 transition-transform" />
            Explore Members
          </Link>
          <Link href="/projects" className="btn-outline group">
            <Code size={20} className="group-hover:rotate-12 transition-transform" />
            View Projects
          </Link>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Members Stat */}
          <div className="card p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="relative">
              <Users 
                size={48} 
                className="mx-auto text-primary mb-4 group-hover:scale-110 transition-transform" 
              />
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h3 className="text-5xl font-bold text-white mb-2 tabular-nums">
              {loading ? (
                <span className="inline-block animate-pulse">...</span>
              ) : (
                <>{animatedStats.members}+</>
              )}
            </h3>
            <p className="text-slate-400 font-medium">Active Members</p>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Projects Stat */}
          <div className="card p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="relative">
              <Code 
                size={48} 
                className="mx-auto text-secondary mb-4 group-hover:scale-110 transition-transform" 
              />
              <div className="absolute inset-0 bg-secondary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h3 className="text-5xl font-bold text-white mb-2 tabular-nums">
              {loading ? (
                <span className="inline-block animate-pulse">...</span>
              ) : (
                <>{animatedStats.projects}+</>
              )}
            </h3>
            <p className="text-slate-400 font-medium">Projects Showcased</p>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Events Stat */}
          <div className="card p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="relative">
              <Calendar 
                size={48} 
                className="mx-auto text-accent mb-4 group-hover:scale-110 transition-transform" 
              />
              <div className="absolute inset-0 bg-accent/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h3 className="text-5xl font-bold text-white mb-2 tabular-nums">
              {loading ? (
                <span className="inline-block animate-pulse">...</span>
              ) : (
                <>{animatedStats.events}+</>
              )}
            </h3>
            <p className="text-slate-400 font-medium">Events Hosted</p>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container-custom py-20">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={28} className="text-accent animate-pulse" />
            <h2 className="section-title">Featured Events</h2>
          </div>
          <p className="section-subtitle">Don&apos;t miss our upcoming events and workshops</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-96 animate-pulse bg-gradient-to-br from-slate-800 to-slate-900" />
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {featuredEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/events" className="btn-primary group">
                View All Events
                <svg 
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="card p-12 text-center">
            <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No featured events yet</p>
            <p className="text-slate-500 text-sm mt-2">Check back soon for exciting workshops and meetups!</p>
          </div>
        )}
      </section>

      {/* Featured Leads */}
      <section className="container-custom py-20">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Users size={28} className="text-secondary" />
            <h2 className="section-title">Meet Our Leads</h2>
          </div>
          <p className="section-subtitle">Outstanding members driving our community forward</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card h-64 animate-pulse bg-gradient-to-br from-slate-800 to-slate-900" />
            ))}
          </div>
        ) : leads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leads.map((member, index) => (
              <div 
                key={member.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No leads available yet</p>
            <p className="text-slate-500 text-sm mt-2">Our community leaders will be featured here soon!</p>
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </Layout>
  );
}