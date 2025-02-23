"use client";

import { Button, Container, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";

const carouselItems = [
  { title: "Fast & Secure", desc: "Experience high-speed and safe browsing." },
  { title: "Interactive UI", desc: "Smooth, modern, and engaging design." },
  { title: "Seamless Login", desc: "Access your account with just one click." },
];

const LandingPage = () => {
  const router = useRouter();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: "center" }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to Our Platform
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Discover a new way to interact with technology.
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          size="large"
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
      </motion.div>

      {/* Carousel Section */}
      <Box sx={{ mt: 5 }}>
        <Slider {...settings}>
          {carouselItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  {item.title}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {item.desc}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Slider>
      </Box>
    </Container>
  );
};

export default LandingPage;
