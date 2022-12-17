---
title: "Seminar"
date: 2021-09-19
---

# Convolutional Neural Networks and Particle Physics

{{< date-last-mod >}}

This project explores the use of convolutional neural networks for classifying the products of high-energy collisions produced in particle physics experiments like the Large Hadron Collider at CERN and was written in the scope of *Seminar* course requirements at the Faculty of Math and Physics at the University of Ljubljana.

You might be interested in...

- [**reading the PDF paper**](paper.pdf)
- the accompanying [**slide show presentation**](presentation.pdf) (also available in [Slovene](presentation-slo.pdf))
- [**browsing the GitHub repo**](https://github.com/ejmastnak/fmf-seminar) containing the project's source files


## About the project

Particle classification means identifying the results of a collision, often as simply as with a binary yes/no answer, e.g. "this collision produced a Higgs boson" or "this collision did not produce a Higgs boson". Performing classification with a high degree of certainty is vital if, say, you are a research group interested in announcing the discovery of a new elementary particle.

{{< img src="classification.png" width="70%" >}}

This project is distinguished by its focus on performing classification using raw, low-level data (i.e. the data produced directly by a particle detector's trackers and calorimeters, without further processing). Classification techniques that produce results directly from low-level data are called "end-to-end" classifiers. End-to-end classifiers are interesting because:
- they eliminate complicated intermediate processing and particle flow reconstruction, and
- they provide a beautifully general, broadly applicable framework, since a wide range of classification problems share the same type of raw data. This means a scientist could use the same class of algorithms to solve a wide variety of problems.

And what about convolutional neural networks? Convolutional neural networks (CNNs) are a class of machine learning systems well-suited to processing image-like data. Raw detector data---the type used in end-to-end classification---takes the form of energy and position information distributed on a two- or three-dimensional spatial grid across the detector's volume. This data is essentially a series of image-like snapshots of the energy and position left behind by particles as they fly through the particle detector. Since CNNs are well-suited to image-like data, they find an application in end-to-end particle classification.

#### Summary

The [paper](paper.pdf) and presentations address the following questions in the progression given below:
- What is meant by particle classification?
- What are the physical quantities comprising low-level collision data, and what are the physical principles behind a modern particle detector's measurement instruments? (We use the Compact Muon Solenoid at the LHC as a concrete example).
- What are fully-connected neural networks and how do they work? (As a foundation for understanding CNNs.)
- What are convolutional neural networks and how do they work? (At a level within the scope of a 20 page paper.)
- Show me a concrete example of CNN-based end-to-end classification! (We summarize the results of the 2020 paper [*End-to-End Physics Event Classification with CMS Open Data*](https://link.springer.com/article/10.1007/s41781-020-00038-8) by M. Andrews, M. Paulini, S. Gleyzer, and B. Poczos in the **Journal of Computing and Software for Big Science**.)

## About the Seminar course at FMF

*Seminar* is a required course for students in the final semester of the undergraduate physics program at the Faculty of Mathematics and Physics at the University of Ljubljana. In the scope of the course, students, under the guidance of a faculty mentor, write a short undergraduate thesis on a currently relevant physics topic and present the topic to their classmates and professors.

The project encompasses two parts:

- a written paper (which should be no more than about 25 pages)
- a 35 to 40-minute slide-show presentation to the student's classmates, course coordinator, and mentor, followed by questions from the audience and a seminar-style discussion of the topic.

The project is intended primarily as an exercise in clear scientific writing and presentation, a training, in some sense, for giving presentations at scientific conferences. However, undergraduate students are neither expected nor encouraged to produce original research in the scope of the *Seminar* course, simply to clearly present their chosen topic at a level suitable (i.e. not too advanced) for a general final-year undergraduate audience.
