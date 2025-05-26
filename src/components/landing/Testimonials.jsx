import { useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    id: 1,
    content: "UniAssist completely transformed my university application process. The AI assistant helped me find the perfect programs, and the mentorship connection led to invaluable guidance from industry professionals.",
    author: "Jessica T.",
    role: "Computer Science Student",
    university: "MIT",
    image: "https://placehold.co/300x300/e2e8f0/64748b?text=JT",
    rating: 5,
  },
  {
    id: 2,
    content: "As a professor, I've been able to connect with motivated students through UniAssist. The platform makes it easy to share knowledge and guide the next generation of professionals in my field.",
    author: "Dr. Robert Chen",
    role: "Professor of Engineering",
    university: "Stanford University",
    image: "https://placehold.co/300x300/e2e8f0/64748b?text=RC",
    rating: 5,
  },
  {
    id: 3,
    content: "Finding a compatible roommate was always a challenge until I discovered UniAssist. The matching system helped me connect with someone who shares my study habits and lifestyle preferences.",
    author: "Michael D.",
    role: "Business Administration Student",
    university: "Harvard University",
    image: "https://placehold.co/300x300/e2e8f0/64748b?text=MD",
    rating: 4,
  },
  {
    id: 4,
    content: "Our company has recruited exceptional interns through UniAssist. The platform's AI matching system helps us find candidates who are truly aligned with our company culture and technical needs.",
    author: "Sarah Johnson",
    role: "HR Director",
    university: "Google",
    image: "https://placehold.co/300x300/e2e8f0/64748b?text=SJ",
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="section bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-primary font-semibold mb-2 block"
          >
            TESTIMONIALS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            What Our Users Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-gray-600 text-lg"
          >
            Hear from students, teachers, mentors, and companies who have experienced the UniAssist difference.
          </motion.p>
        </div>

        <div className="relative">
          {/* Desktop Testimonials */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.university}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Testimonial Carousel */}
          <div className="md:hidden">
            <motion.div
              key={testimonials[currentIndex].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonials[currentIndex].content}"</p>
              <div className="flex items-center">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].author}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonials[currentIndex].author}</h4>
                  <p className="text-sm text-gray-600">{testimonials[currentIndex].role}</p>
                  <p className="text-xs text-gray-500">{testimonials[currentIndex].university}</p>
                </div>
              </div>
            </motion.div>

            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 