-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 28, 2024 at 01:13 PM
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
-- Table structure for table `atm`
--

CREATE TABLE `atm` (
  `id` int(11) NOT NULL,
  `AtmId` varchar(50) NOT NULL,
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
  `BankId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `atm`
--

INSERT INTO `atm` (`id`, `AtmId`, `State`, `City`, `Address`, `BranchCode`, `SiteId`, `Lho`, `Region`, `OldAtmId`, `NewAtmId`, `SiteStatus`, `BankId`) VALUES
(3, 'AECN13313', 'Uttar Pradesh', 'Kanpur', 'IG4.37/54 Capital Tower.Kotwali Chauraha,Gilish Bazar Meston Road Kanpur 208001,', '', '', '', 'North', '', 'AECN13313', 'Active', 1);

-- --------------------------------------------------------

--
-- Table structure for table `atmregion`
--

CREATE TABLE `atmregion` (
  `id` int(11) NOT NULL,
  `RegionId` varchar(25) NOT NULL,
  `RegionName` enum('North','South','North 1','South 1','North 2','South 2') NOT NULL,
  `GstStateCode` varchar(10) NOT NULL,
  `AtmId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `atmregion`
--

INSERT INTO `atmregion` (`id`, `RegionId`, `RegionName`, `GstStateCode`, `AtmId`) VALUES
(1, '', 'North', '', 3);

-- --------------------------------------------------------

--
-- Table structure for table `bank`
--

CREATE TABLE `bank` (
  `id` int(11) NOT NULL,
  `BankId` varchar(12) NOT NULL,
  `BankName` varchar(255) NOT NULL,
  `AtmCount` int(11) NOT NULL,
  `Field` varchar(125) NOT NULL,
  `CustomerId` int(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bank`
--

INSERT INTO `bank` (`id`, `BankId`, `BankName`, `AtmCount`, `Field`, `CustomerId`) VALUES
(1, 'AXIS123', 'Axis', 12, '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` int(11) NOT NULL,
  `CustomerId` varchar(12) NOT NULL,
  `CustomerName` varchar(125) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `CustomerId`, `CustomerName`) VALUES
(1, 'Advait123', 'Euronet');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `id` int(11) NOT NULL,
  `EmployeeId` varchar(12) NOT NULL,
  `EmployeeName` varchar(125) NOT NULL,
  `EmployeeRole` enum('P-Team Leader','Team Leader','Supervisor','Custodian') NOT NULL,
  `EmployeeContactNumber` int(12) NOT NULL,
  `TypeOfWork` enum('Offsite','Onsite') NOT NULL,
  `AtmId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`id`, `EmployeeId`, `EmployeeName`, `EmployeeRole`, `EmployeeContactNumber`, `TypeOfWork`, `AtmId`) VALUES
(2, '', 'Uma', 'P-Team Leader', 0, 'Onsite', 3);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `ServiceId` varchar(12) NOT NULL,
  `ServiceType` enum('HK','BLM','CT','FIXED RNM','EB','AUDIT') NOT NULL,
  `TakeoverDate` date NOT NULL,
  `HandoverDate` date NOT NULL,
  `PayOut` float NOT NULL,
  `CostToClient` float NOT NULL,
  `AtmId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `ServiceId`, `ServiceType`, `TakeoverDate`, `HandoverDate`, `PayOut`, `CostToClient`, `AtmId`) VALUES
(1, 'HK-1', 'HK', '2015-05-15', '2019-11-04', 400, 900, 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `atm`
--
ALTER TABLE `atm`
  ADD PRIMARY KEY (`id`),
  ADD KEY `BankId` (`BankId`);

--
-- Indexes for table `atmregion`
--
ALTER TABLE `atmregion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AtmId` (`AtmId`);

--
-- Indexes for table `bank`
--
ALTER TABLE `bank`
  ADD PRIMARY KEY (`id`),
  ADD KEY `CustomerId` (`CustomerId`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AtmId` (`AtmId`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AtmId` (`AtmId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `atm`
--
ALTER TABLE `atm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `atmregion`
--
ALTER TABLE `atmregion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bank`
--
ALTER TABLE `bank`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `atm`
--
ALTER TABLE `atm`
  ADD CONSTRAINT `BankId` FOREIGN KEY (`BankId`) REFERENCES `bank` (`id`);

--
-- Constraints for table `atmregion`
--
ALTER TABLE `atmregion`
  ADD CONSTRAINT `AtmId` FOREIGN KEY (`AtmId`) REFERENCES `atm` (`id`);

--
-- Constraints for table `bank`
--
ALTER TABLE `bank`
  ADD CONSTRAINT `CustomerId` FOREIGN KEY (`CustomerId`) REFERENCES `customer` (`id`);

--
-- Constraints for table `employee`
--
ALTER TABLE `employee`
  ADD CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`AtmId`) REFERENCES `atm` (`id`);

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`AtmId`) REFERENCES `atm` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
