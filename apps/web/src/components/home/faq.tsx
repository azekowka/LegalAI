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
    question: "What services does your AI agency offer?",
    answer:
      "We specialize in custom AI solutions including chatbots, predictive analytics, computer vision, NLP, and automation workflows tailored to your business needs.",
  },
  {
    icon: Settings2,
    question: "Can you integrate AI into our existing systems?",
    answer:
      "Absolutely! We offer seamless integration with CRMs, ERPs, databases, APIs, and other third-party tools your business relies on.",
  },
];

const howToUse = [
  {
    icon: AlertCircle,
    question: "What if the AI model doesn't perform well?",
    answer:
      "We conduct thorough testing and offer ongoing optimization post-launch. If something's off, we'll tweak it until it delivers results.",
  },
  {
    icon: BookOpenText,
    question: "Do you provide documentation and training?",
    answer:
      "Yes, we provide clear documentation and offer team training to help you and your staff understand and make the most of the AI systems we implement.",
  },
  {
    icon: Wallet,
    question: "What's your pricing model?",
    answer:
      "We offer flexible pricing based on project complexity and duration—ranging from fixed project fees to retainer and hourly models.",
  },
  {
    icon: MailCheck,
    question: "How do we get started?",
    answer:
      "Just reach out via our contact form or email. We'll schedule a free consultation to understand your needs and propose the best AI strategy for you.",
  },
  {
    icon: ShieldCheck,
    question: "Do you offer support post-deployment?",
    answer:
      "Yes, our partnership doesn't end after delivery. We offer maintenance plans, bug fixes, performance monitoring, and continuous updates.",
  },
  {
    icon: Presentation,
    question: "Can we see previous case studies or demos?",
    answer:
      "Definitely! We're happy to share relevant case studies and showcase live demos of our previous AI solutions, depending on NDA limitations.",
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
          TRUSTED BY
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
          We have posted frequently asked questions about product usage and
          sales. Please select the question that applies to you and check it.
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
