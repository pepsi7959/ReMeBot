CREATE TABLE `MeetingRoom` (
  `id` int(11) NOT NULL,
  `room` varchar(64) NOT NULL,
  `meeting_begin` datetime NOT NULL,
  `meeting_end` datetime NOT NULL,
  `reserver` varchar(64) NOT NULL,
  `internal_tel` varchar(45) DEFAULT NULL,
  `division` varchar(128) NOT NULL,
  `department` varchar(128) DEFAULT NULL,
  `agenda` varchar(256) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idMeetingRoom_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8