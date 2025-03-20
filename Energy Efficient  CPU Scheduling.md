
                                   TERM PAPER:

Energy Efficient CPU Scheduling Algorithms

         NIKHIL SINGH                   AASHISH BHASKAR                   NAVJOT KAUR

  tech.nikhilsingh@gmail.com          imaashishbhaskar@gmail.com

 Lovely Professional University, Jalandhar-Punjab, India

                  www.lpu.in

Index:

•	Abstract

1.	Introduction

2.	Comparison of CPU Scheduling Algorithms

2.1 First-Come, First-Served (FCFS)
2.2 Shortest Job First (SJF)
2.3 Round Robin (RR)
2.4 Priority Scheduling
2.5 Performance Comparison

3.	Improvement of Round Robin Scheduling

3.1 Dynamic Time Quantum

4.	Real-Time CPU Scheduling

4.1 Rate-Monotonic Scheduling (RMS)
4.2 Earliest Deadline First (EDF)

5.	Energy-Efficient Scheduling

5.1 Dynamic Voltage and Frequency Scaling (DVFS)
5.2 Sleep/Wake Algorithms (Idle Time Management)
5.3 Hybrid Approaches
5.4 Use in Mobile Devices
5.5 Use in Embedded System

6.	Machine Learning in CPU Scheduling

6.1 Predictive Models for Estimation of Job Length
6.2 Pattern Recognition in Workloads
6.3 Reinforcement Learning for Optimal Scheduling
6.4 Neural Networks for Complex Scheduling Decisions

7.	Conclusion

8.	References



Abstract

This report will be a detailed study of the different CPU scheduling algorithms. The performance, weaknesses, and possible improvements for the different algorithms can be found. On traditional algorithms, such as First-Come, First-Served (FCFS), Shortest Job First (SJF), Priority Scheduling, and Round Robin, it is possible to make further comparisons on how those algorithms are different from one another in different computing environments. Further analysis has been conducted based on metrics including throughput, waiting time, response time, and CPU utilization for each algorithm. Other new topics covered in CPU scheduling include low-power algorithms that focus on reduction in energy consumption in current systems and real-time scheduling applied in the use of time-critical tasks in embedded and safety-critical systems. The report further does an analysis of the application of machine learning techniques in optimizing CPU scheduling with predictive models dynamically adapted to scheduling decisions in search of higher performance in variable workloads. Challenges of the Approach This section discusses some of the challenges associated with the approach: the trade-off between scheduling fairness and performance, as well as between real-time constraints and power efficiency. Finally, some improvements are proposed to overcome such challenges; hence, the discussion includes several hybrid scheduling approaches and adaptive algorithms.


1. Introduction

It plays a very significant role about how the access to CPU is allocated to the process in the operating system and which in turn is very important to protect the performance and efficiency of the system. Therefore, this is an inevitable need that may arise since computers and devices deal with bigger numbers of tasks, and so the OS has to determine a sequence as well as period for which each process has to access the CPU. This naturally leads to defining key performance metrics: Throughput, response time, CPU utilization, and fairness. Several classic scheduling algorithms have been developed to fulfill this need, including First-Come, First-Served, Shortest Job First, Round Robin, and Priority Scheduling. 
In addition to those traditional techniques of scheduling, significant advancement has taken place in scheduling innovations that fulfill the need for modern computing environments. For instance, real-time systems used in medical devices or industrial controls are subject to specific algorithms for scheduling, like RMS and EDF, that ensure fundamental timing constraints. Energy efficiency becomes yet another very relevant consideration in the context of CPU scheduling, especially in mobile and embedded systems where battery life is considered significant. Power is scaled down without hurting performance too badly by techniques like Dynamic Voltage and Frequency Scaling (DVFS). It is widely applied to a domain that machine learning operates in, which is CPU scheduling. Systems continuously learn dynamic adaptation to changing workloads and adapt scheduling based on patterns and predictions. In a sense, innovation has been driven by the complexity and variability of modern computing environments-a "perfect storm" that ensures CPU scheduling remains well-tuned to forward needs.[1],[2],[3]


                            Fig 1 .The figure depicts a classification of CPU scheduling algorithms into Preemptive 
                            (e.g., Round Robin, SRTF, Preemptive Priority) and Non-Preemptive (e.g., FCFS, SJF, 
                            Non-Preemptive Priority) categories.[5]



                            Fig 2 .The figure illustrates a job scheduling flow where jobs first enter the Ready Queue. 
                            From there, the Dispatcher either directs jobs to the CPU for execution or moves them to the 
                            Waiting Queue if resources are unavailable. This process shows the decision paths for jobs in
                            a CPU scheduling system.[5]
                            

