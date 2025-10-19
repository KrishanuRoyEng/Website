import Layout from '@/components/Layout';
import EventCard from '@/components/EventCard';
import MemberCard from '@/components/MemberCard';
import { eventApi, memberApi } from '@/lib/api';
import { Event, Member } from '@/lib/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Users, Code, Calendar } from 'lucide-react';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [leads, setLeads] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsRes, membersRes] = await Promise.all([
          eventApi.getAll({ featuredOnly: true }).catch(err => {
            console.error('Events API error:', err.message, err.config?.url);
            return { data: [] };
          }),
          memberApi.getAll({ approvedOnly: true }).catch(err => {
            console.error('Members API error:', err.message, err.config?.url);
            return { data: [] };
          }),
        ]);

        setFeaturedEvents(eventsRes.data?.slice(0, 3) || []);
        setLeads(membersRes.data?.filter((m: Member) => m.user.isLead).slice(0, 4) || []);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="container-custom py-24 text-center">
        <div className="mb-6 inline-block">
          <span className="badge-primary">Welcome to CodeClub</span>
        </div>
        <h1 className="section-title mb-4">
          Build Together, Create Amazing
        </h1>
        <p className="section-subtitle max-w-2xl mx-auto">
          A community of passionate developers collaborating on innovative projects, sharing knowledge, and growing together.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/members" className="btn-primary">
            <Users size={20} />
            Explore Members
          </Link>
          <Link href="/projects" className="btn-outline">
            <Code size={20} />
            View Projects
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <Users size={32} className="mx-auto text-primary mb-4" />
            <h3 className="text-3xl font-bold text-white mb-2">200+</h3>
            <p className="text-slate-400">Active Members</p>
          </div>
          <div className="card p-6 text-center">
            <Code size={32} className="mx-auto text-secondary mb-4" />
            <h3 className="text-3xl font-bold text-white mb-2">150+</h3>
            <p className="text-slate-400">Projects Showcased</p>
          </div>
          <div className="card p-6 text-center">
            <Calendar size={32} className="mx-auto text-accent mb-4" />
            <h3 className="text-3xl font-bold text-white mb-2">50+</h3>
            <p className="text-slate-400">Events Hosted</p>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container-custom py-20">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={28} className="text-accent" />
            <h2 className="section-title">Featured Events</h2>
          </div>
          <p className="section-subtitle">Don&apos;t miss our upcoming events and workshops</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-96 animate-pulse" />
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400">No featured events yet</p>
        )}

        <div className="text-center">
          <Link href="/events" className="btn-primary">
            View All Events
          </Link>
        </div>
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
              <div key={i} className="card h-64 animate-pulse" />
            ))}
          </div>
        ) : leads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leads.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400">No leads available yet</p>
        )}
      </section>
    </Layout>
  );
}
