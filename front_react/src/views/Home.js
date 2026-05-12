import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container } from 'reactstrap';
import logo from '../assets/img/PNESTP.png';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Home = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  React.useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        overflow: 'hidden'
      }}
    >
      <Container className="py-5">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            style={{ marginBottom: '3rem' }}
          >
            <motion.img
              src={logo}
              alt="PNESTP"
              style={{
                height: '290px',
                width: 'auto',
                filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.1))'
              }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="display-4 mb-4 font-weight-bold"
            style={{ 
              color: '#343a40',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Bem-vindo ao PNESTP
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="lead mb-5 text-muted"
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            Aprender é o primeiro passo para mudar o mundo — e o teu começa agora!
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="d-flex justify-content-center gap-4 mt-5"
          >
            <motion.div
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                tag={Link}
                to="/auth/login"
                size="lg"
                className="px-5 py-3 rounded-pill shadow"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  minWidth: '180px'
                }}
              >
                Login
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                tag={Link}
                to="/auth/register"
                size="lg"
                className="px-5 py-3 rounded-pill shadow"
                style={{
                  fontSize: '1.0rem',
                  fontWeight: '600',
                  background: 'white',
                  color: '#764ba2',
                  border: '2px solid #764ba2',
                  minWidth: '180px',
                  marginLeft: '10px',
                }}
              >
                Cadastrar
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default Home;