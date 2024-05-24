-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 16, 2024 at 06:45 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hrmsapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(25) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phonenumber` varchar(10) DEFAULT NULL,
  `access` enum('SuperAdmin','Admin','Employee','') DEFAULT NULL,
  `session_intime` varchar(225) DEFAULT NULL,
  `session_outtime` varchar(225) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `username`, `password`, `phonenumber`, `access`, `session_intime`, `session_outtime`) VALUES
(50, 'arnav', 'arnavsinghp27@gmail.com', '$2a$10$o08AR0qk1CBRu0p/3Mmq2e/rx0yt0JyjDzlxj6Q6HyZ92gLHQNjEC', '9323839021', 'SuperAdmin', NULL, NULL),
(66, 'nitesh', 'nitish@gmail.com', '$2a$10$YRwbS9l5E638o7j0Whpfvu4g8Z53LLk4nzvJcH/J8M455fXBVqLxa', '9323839021', 'Admin', NULL, NULL),
(69, 'mango', 'mango@gmail.com', '$2a$10$UlwOLBgPn3flLEfqQwuMoOLcD.0zOxhTDQF3YSl7vV4uwkyv/Z3B.', '1241241241', 'Employee', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `atm`
--

CREATE TABLE `atm` (
  `AtmId` varchar(15) NOT NULL,
  `Country` varchar(125) NOT NULL,
  `State` varchar(125) NOT NULL,
  `City` varchar(125) NOT NULL,
  `Address` varchar(255) NOT NULL,
  `BranchCode` varchar(25) NOT NULL,
  `SiteId` varchar(25) NOT NULL,
  `Lho` varchar(25) NOT NULL,
  `Region` varchar(25) NOT NULL,
  `OldAtmId` varchar(50) NOT NULL,
  `NewAtmId` varchar(50) NOT NULL,
  `SiteStatus` enum('Active','Inactive') NOT NULL,
  `BankId` varchar(15) NOT NULL,
  `CustomerId` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `atm`
--

INSERT INTO `atm` (`AtmId`, `Country`, `State`, `City`, `Address`, `BranchCode`, `SiteId`, `Lho`, `Region`, `OldAtmId`, `NewAtmId`, `SiteStatus`, `BankId`, `CustomerId`) VALUES
('ghwq21331', '', '', '', 'airport', 'fgqwe12345', 'mubaunai12', 'kerela', '', '', 'ghwq21331', 'Active', 'WU21W54', 'imdkvkHRTZ2y'),
('qsqs11111', '', '', '', 'Mumbai', 'qwe1234', 'ght122', 'Mumbai', '', '', '', 'Inactive', '7cIJ0C4', 'Euro123'),
('vbnmc123', '', '', '', 'airport', 'fgqwe12345', 'mubaunai12', 'kerela', '', '', '', 'Active', 'WU21W54', 'imdkvkHRTZ2y'),
('wctyqd123', '', '', '', 'Mumbai', 'qwe1234', 'ght122', 'Mumbai', '', '', '', 'Active', '7cIJ0C4', 'Euro123');

-- --------------------------------------------------------

--
-- Table structure for table `atmid_oldatmid`
--

CREATE TABLE `atmid_oldatmid` (
  `AtmId` varchar(50) NOT NULL,
  `OldAtmId` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `atmregion`
--

CREATE TABLE `atmregion` (
  `RegionId` varchar(15) NOT NULL,
  `RegionName` enum('North','South','North 1','South 1','North 2','South 2') NOT NULL,
  `GstStateCode` varchar(10) NOT NULL,
  `AtmId` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `atmregion`
--

INSERT INTO `atmregion` (`RegionId`, `RegionName`, `GstStateCode`, `AtmId`) VALUES
('N1', 'North', 'gst123', 'ghwq21331');

-- --------------------------------------------------------

--
-- Table structure for table `atm_employee`
--

CREATE TABLE `atm_employee` (
  `AtmId` varchar(15) NOT NULL,
  `EmployeeId` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `atm_employee`
--

INSERT INTO `atm_employee` (`AtmId`, `EmployeeId`) VALUES
('NA', 'arnav11'),
('qsqs11111', 'arnav11'),
('wctyqd123', 'arnav11'),
('wctyqd123', 'arnav11'),
('ghwq21331', 'arnav11'),
('vbnmc123', 'arnav11');

-- --------------------------------------------------------

--
-- Table structure for table `bank`
--

CREATE TABLE `bank` (
  `BankId` varchar(15) NOT NULL,
  `BankName` varchar(255) NOT NULL,
  `AtmCount` int(11) NOT NULL,
  `Field` varchar(125) NOT NULL,
  `CustomerId` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bank`
--

INSERT INTO `bank` (`BankId`, `BankName`, `AtmCount`, `Field`, `CustomerId`) VALUES
('7cIJ0C4', 'axis bank', 12, 'dev', 'Euro123'),
('lsk0qft', 'hdfc', 12, 'mumbai', 'I18ESQNTsL4g'),
('WU21W54', 'idfc', 12, 'werty', 'imdkvkHRTZ2y');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `CustomerId` varchar(15) NOT NULL,
  `CustomerName` varchar(125) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`CustomerId`, `CustomerName`) VALUES
('Euro123', 'Euronet'),
('I18ESQNTsL4g', 'hello'),
('imdkvkHRTZ2y', 'weeeee'),
('jUwTsYuafp3e', 'helium1'),
('pTCDEP1hDdxS', 'helium');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `EmployeeId` varchar(15) NOT NULL,
  `EmployeeName` varchar(125) NOT NULL,
  `EmployeeRole` enum('P-Team Leader','Team Leader','Supervisor','Custodian') NOT NULL,
  `EmployeeContactNumber` int(12) NOT NULL,
  `TypeOfWork` enum('Offsite','Onsite') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`EmployeeId`, `EmployeeName`, `EmployeeRole`, `EmployeeContactNumber`, `TypeOfWork`) VALUES
('arnav11', 'arnav', 'P-Team Leader', 2147483647, 'Onsite');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `ServiceId` varchar(15) NOT NULL,
  `ServiceType` enum('HK','BLM','CT','FIXED RNM','EB','AUDIT') NOT NULL,
  `TakeoverDate` varchar(10) NOT NULL,
  `HandoverDate` varchar(10) NOT NULL,
  `CostToClient` float NOT NULL,
  `AtmId` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`ServiceId`, `ServiceType`, `TakeoverDate`, `HandoverDate`, `CostToClient`, `AtmId`) VALUES
('HK1', 'HK', '05-05-2005', '05-05-2006', 900, 'ghwq21331'),
('HK123', 'HK', '2009-12-12', '2010-12-12', 900, 'qsqs11111'),
('HK123', 'HK', '2009-12-12', '2010-12-12', 900, 'wctyqd123'),
('BLM456', 'BLM', '2024-05-06', '2024-06-01', 800, 'qsqs11111'),
('BLM456', 'BLM', '2024-05-06', '2024-06-01', 800, 'wctyqd123');

-- --------------------------------------------------------

--
-- Table structure for table `uploadfiledata`
--

CREATE TABLE `uploadfiledata` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `uploadedBy` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `uploadedTime` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_username` (`username`);

--
-- Indexes for table `atm`
--
ALTER TABLE `atm`
  ADD PRIMARY KEY (`AtmId`),
  ADD KEY `fk_atm_bank` (`BankId`),
  ADD KEY `fk_CustomerId` (`CustomerId`);

--
-- Indexes for table `atmid_oldatmid`
--
ALTER TABLE `atmid_oldatmid`
  ADD KEY `fk_atmId_oldatmId` (`AtmId`);

--
-- Indexes for table `atmregion`
--
ALTER TABLE `atmregion`
  ADD KEY `fk_atmregion_atm` (`AtmId`);

--
-- Indexes for table `atm_employee`
--
ALTER TABLE `atm_employee`
  ADD KEY `fk_atmid_empid` (`EmployeeId`);

--
-- Indexes for table `bank`
--
ALTER TABLE `bank`
  ADD PRIMARY KEY (`BankId`),
  ADD KEY `fk_bank_customer` (`CustomerId`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`CustomerId`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`EmployeeId`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD KEY `fk_services_atm` (`AtmId`);

--
-- Indexes for table `uploadfiledata`
--
ALTER TABLE `uploadfiledata`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `uploadfiledata`
--
ALTER TABLE `uploadfiledata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `atm`
--
ALTER TABLE `atm`
  ADD CONSTRAINT `fk_CustomerId` FOREIGN KEY (`CustomerId`) REFERENCES `customer` (`CustomerId`),
  ADD CONSTRAINT `fk_atm_bank` FOREIGN KEY (`BankId`) REFERENCES `bank` (`BankId`);

--
-- Constraints for table `atmid_oldatmid`
--
ALTER TABLE `atmid_oldatmid`
  ADD CONSTRAINT `fk_atmId_oldatmId` FOREIGN KEY (`AtmId`) REFERENCES `atm` (`AtmId`);

--
-- Constraints for table `atmregion`
--
ALTER TABLE `atmregion`
  ADD CONSTRAINT `fk_atmregion_atm` FOREIGN KEY (`AtmId`) REFERENCES `atm` (`AtmId`);

--
-- Constraints for table `atm_employee`
--
ALTER TABLE `atm_employee`
  ADD CONSTRAINT `fk_atmid_empid` FOREIGN KEY (`EmployeeId`) REFERENCES `employee` (`EmployeeId`);

--
-- Constraints for table `bank`
--
ALTER TABLE `bank`
  ADD CONSTRAINT `fk_bank_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customer` (`CustomerId`);

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `fk_services_atm` FOREIGN KEY (`AtmId`) REFERENCES `atm` (`AtmId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
