import React from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-zinc-100 bg-zinc-50/30">
        <div className="container mx-auto px-6 lg:px-12 py-10">
          <h1 className="text-3xl font-bold text-zinc-900">Help Center</h1>
          <p className="text-zinc-500 mt-2">
            Everything you need to know about using our platform.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 lg:px-12 py-12 flex flex-col lg:flex-row gap-16">
        {/* FAQs */}
        <div className="flex-1 max-w-3xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-500">
              Quick answers to questions you might have.
            </p>
          </div>

          <Accordion className="w-full">
            <AccordionItem value="item-1" className="border-zinc-200 py-2">
              <AccordionTrigger className="text-left font-semibold text-zinc-900 hover:no-underline hover:text-blue-600 transition-colors">
                How do I save a job to apply later?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-500 leading-relaxed">
                You can save a job by clicking the bookmark icon on any job
                card. It will automatically be added to your "Saved Jobs" page,
                which you can access from the top navigation menu.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-zinc-200 py-2">
              <AccordionTrigger className="text-left font-semibold text-zinc-900 hover:no-underline hover:text-blue-600 transition-colors">
                How do I know if my application was seen?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-500 leading-relaxed">
                When you apply for a job, you can track its status in the
                "Applied" section. We will notify you when a recruiter views
                your application or updates its status.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-zinc-200 py-2">
              <AccordionTrigger className="text-left font-semibold text-zinc-900 hover:no-underline hover:text-blue-600 transition-colors">
                How can I expand my professional network?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-500 leading-relaxed">
                Head over to the "Network" tab to discover professionals in your
                industry. You can send connection requests and direct messages
                to start conversations with peers, recruiters, and industry
                leaders.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-zinc-200 py-2">
              <AccordionTrigger className="text-left font-semibold text-zinc-900 hover:no-underline hover:text-blue-600 transition-colors">
                Are there fees for applying to jobs?
              </AccordionTrigger>
              <AccordionContent className="text-zinc-500 leading-relaxed">
                No, our platform is completely free for job seekers. You can
                browse, save, and apply to as many roles as you like without any
                hidden costs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Contact Support */}
        <div className="w-full lg:w-[350px] flex flex-col gap-6 shrink-0">

          <div className="bg-zinc-50/80 border border-zinc-100 rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">
              Email Support
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              Prefer email? Send us a message and we'll reply within 24 hours.
            </p>
            <Button
              variant="outline"
              className="w-full rounded-full font-semibold h-12 border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-transform active:scale-95"
            >
              Email Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
