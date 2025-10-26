"use client";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@/components/ui/accordion";
import { TimelineContent } from "@/components/ui/timeline-animation";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import {
  AlertCircle,
  BookOpenText,
  Bot,
  MailCheck,
  Plus,
  Presentation,
  Settings2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useRef } from "react";

const productDetails = [
  {
    icon: Bot,
    question: "What is Legal AI?",
    answer:
      "Legal AI is a platform that leverages artificial intelligence to streamline legal workflows. It can analyze legal documents, conduct research, generate contracts, and assist with due diligence, helping legal professionals save time and reduce errors.",
  },
  {
    icon: ShieldCheck,
    question: "Is my data secure with Legal AI?",
    answer:
      "Data security is our top priority. We use state-of-the-art encryption and comply with industry-standard data protection regulations to ensure your confidential information is always secure. For more information, please see our Privacy Policy.",
  },
  {
    icon: Settings2,
    question: "Who can benefit from using Legal AI?",
    answer:
      "Legal AI is designed for law firms, in-house legal teams, and individual legal practitioners. It's also beneficial for businesses that handle a large volume of contracts and legal documents.",
  },
];

const howToUse = [
  {
    icon: MailCheck,
    question: "How do I get started with Legal AI?",
    answer:
      "Getting started is easy! Simply sign up for a demo on our website. We'll walk you through the platform's features and help you set up your account.",
  },
  {
    icon: Settings2,
    question:
      "Can Legal AI integrate with my current document management system?",
    answer:
      "Yes, Legal AI is designed to integrate seamlessly with popular document management systems, cloud storage services, and legal practice management software.",
  },
  {
    icon: BookOpenText,
    question: "What kind of support do you offer?",
    answer:
      "We offer comprehensive support, including a detailed knowledge base, email support, and live chat. For enterprise clients, we provide dedicated account managers and personalized training sessions.",
  },
  {
    icon: Wallet,
    question: "What are the pricing plans for Legal AI?",
    answer:
      "We offer various pricing plans to suit different needs, from solo practitioners to large enterprises. You can find detailed information on our pricing page or contact our sales team for a custom quote.",
  },
  {
    icon: Presentation,
    question: "Can I try Legal AI before committing to a subscription?",
    answer:
      "Yes, we offer a free trial period that gives you access to all of Legal AI's features. This allows you to experience the benefits firsthand before making a decision.",
  },
  {
    icon: AlertCircle,
    question: "How accurate is the AI?",
    answer:
      "Our AI models are trained on vast datasets of legal documents and are constantly updated to ensure high accuracy. However, Legal AI is intended to be a tool to assist legal professionals, not replace their professional judgment.",
  },
];

export default function Faqs4() {
  const faqsRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.3,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: 0,
      opacity: 0,
    },
  };

  return (
    <div
      id="faq"
      className="p-5 mx-auto rounded-2xl max-w-3xl shadow-sm mt-4"
      ref={faqsRef}
    >
      <article className="text-left space-y-3 pb-14">
        <TimelineContent
          as="span"
          animationNum={0}
          timelineRef={faqsRef}
          customVariants={revealVariants}
          className="text-sm font-semibold"
        >
          FAQs
        </TimelineContent>

        <h2 className="sm:text-4xl text-3xl font-medium">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-start"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0.4, // After "TRUSTED BY" (animationNum 0)
            }}
          >
            Frequently Asked Questions
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          className="sm:text-base text-sm"
          animationNum={1}
          timelineRef={faqsRef}
          customVariants={revealVariants}
        >
          Explore detailed answers to the most commonly asked questions about our platform, features, integrations
        </TimelineContent>
      </article>

      <TimelineContent
        as="h1"
        animationNum={2}
        timelineRef={faqsRef}
        customVariants={revealVariants}
        className="text-2xl font-medium"
      >
        Product Details
      </TimelineContent>

      <Accordion defaultValue="item-2">
        {productDetails.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="mb-0 rounded-none bg-neutral-100 border border-neutral-200 w-full p-3 mt-4"
          >
            <TimelineContent
              as="div"
              animationNum={3 + index}
              timelineRef={faqsRef}
              customVariants={revealVariants}
            >
              <AccordionHeader
                customIcon
                className="hover:no-underline p-0 relative data-[active]:bg-transparent hover:bg-transparent text-neutral-950 hover:text-neutral-950  data-[active]:text-neutral-950 sm:text-base text-sm"
              >
                <div className="flex items-center sm:gap-16 gap-4">
                  <span className="font-medium">
                    <item.icon />
                  </span>
                  <span className="font-medium sm:text-base text-sm inline-block">
                    {item.question}
                  </span>
                </div>
                <span className="relative group-data-[active]:rotate-90 text-neutral-950 p-2 -translate-x-1 rounded-xl">
                  <Plus className="group-data-[active]:rotate-90 transition-all duration-300" />
                </span>
              </AccordionHeader>
            </TimelineContent>
            <TimelineContent
              as="div"
              animationNum={3 + index}
              timelineRef={faqsRef}
              customVariants={revealVariants}
            >
              <AccordionPanel
                className="space-y-4 w-full mx-auto  bg-neutral-100"
                articleClassName="pt-3 px-2 bg-neutral-100"
              >
                <p className="text-sm sm:text-base">{item.answer}</p>
              </AccordionPanel>
            </TimelineContent>
          </AccordionItem>
        ))}
      </Accordion>

      <TimelineContent
        as="h1"
        animationNum={5}
        timelineRef={faqsRef}
        customVariants={revealVariants}
        className="text-2xl font-medium pt-14"
      >
        How to Use
      </TimelineContent>

      <Accordion defaultValue="item-2">
        {howToUse.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="mb-0 rounded-none bg-neutral-100 border border-neutral-200 w-full p-4 mt-4"
          >
            <TimelineContent
              as="div"
              animationNum={6 + index}
              timelineRef={faqsRef}
              customVariants={revealVariants}
            >
              <AccordionHeader
                customIcon
                className="hover:no-underline p-0 sm:pl-4 py-1 relative data-[active]:bg-transparent hover:bg-transparent text-neutral-950 hover:text-neutral-950  data-[active]:text-neutral-950 sm:text-base text-sm"
              >
                <div className="flex items-center sm:gap-16 gap-4">
                  <span className="font-medium">
                    <item.icon />
                  </span>
                  <span className="font-medium sm:text-base text-sm inline-block">
                    {item.question}
                  </span>
                </div>
                <span className="relative group-data-[active]:rotate-90  text-neutral-950 p-2 -translate-x-1 rounded-xl">
                  <Plus className="group-data-[active]:rotate-90 transition-all duration-300" />
                </span>
              </AccordionHeader>
            </TimelineContent>
            <TimelineContent
              as="div"
              animationNum={6 + index}
              timelineRef={faqsRef}
              customVariants={revealVariants}
            >
              <AccordionPanel
                className="space-y-4 w-full mx-auto  group-data-[active]:bg-transparent bg-transparent"
                articleClassName="pt-3 px-2 bg-transparent text-gray-700"
              >
                <p className="text-sm sm:text-base">{item.answer}</p>
              </AccordionPanel>
            </TimelineContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
