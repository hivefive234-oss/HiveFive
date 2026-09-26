require(tidyverse, quietly = T)
require(httr, quietly = T) 
require(jsonlite, quietly = T)
library(readxl)
library(reshape2)


# Read inspections data dump

inspections <- read.csv(insp_data)
inspections$name <- inspections$hive_type
inspections$hive_type <- inspections$hive_type.1
inspections$hive_type.1 <- NULL



# change this if you don't need all keys
# some keys:
goodkeys <- data.frame(key=unique(inspections$key))

# Create wide format dataframe, so one row equals one inspection by one key

insp_wide <- inspections %>%
  select(-deleted_at,
         -category_input_id,
         -name,
         -hive_id) %>%
  dplyr::rename(obs_type = translation) %>%
  # join goodkeys table to filter for live keys
  inner_join(goodkeys, by = "key") %>%
  # create unique variable per observation type and category id (e. g. "Menge" could relate to different observation types - category_id specifies this!)
  mutate(obs_id = paste(category_id, "_", obs_type)) %>%
  select(-category_id, -obs_type) %>%
  dcast(key + inspection_id + created_at + notes + reminder + impression + attention + coordinate_lat + coordinate_lon + location_id ~ obs_id, value.var = "value") %>%
  # Extract only the first observation per inspection_id (e. g. x (ommited due to anonymisation) and y (ommited due to anonymisation) have created the same inputs per inspection_id, but we want only one entry per inspection_id)
  arrange(inspection_id, key) %>%
  group_by(inspection_id) 

# Transform Value columns to numeric
insp_wide[10:40] <- sapply(insp_wide[10:40], as.integer)
insp_wide[42:54] <- sapply(insp_wide[42:54], as.integer)
insp_wide$`993 _ Varroa` <- as.integer(insp_wide$`993 _ Varroa`)
insp_wide$`988 _ beweiselt mit` <- as.integer(insp_wide$`988 _ beweiselt mit`)



# Check for variables with more than 90% entries and delete inspections with NAs in those (except for impression & attention)

summary(insp_wide)

events <- c("968 _ Schwarm abgegangen", 
            "595 _ Behandlung",
            "476 _ Fütterung",
            "1012 _ Bau von Weiselzellen",
            "495 _ Honig",
            "983 _ Art der Inspektion",
            "769 _ Volk eingegangen"
            )

insp_comp <- insp_wide %>%
  select(which(colMeans(is.na(.)) < 0.1 |names(.) %in% events)) %>%
  #na.omit() %>%
  dplyr::rename(feeding = `476 _ Fütterung`,
         flight_activity = `963 _ Flugaktivität`,
         placidity = `964 _ Sanftmut`,
         weisel = "1012 _ Bau von Weiselzellen",
         honey = "495 _ Honig",
         treatment = "595 _ Behandlung",
         swarming = "968 _ Schwarm abgegangen",
         inspection_type = `983 _ Art der Inspektion`,
         died = "769 _ Volk eingegangen") %>%
  dplyr::mutate(impression = as.integer(as.character(na_if(impression, "NULL")))) 
# %>%  select(key, created_at, inspection_id, inspection_type, impression, attention, feeding, flight_activity, placidity, notes)


insp_comp$inspection_description <- rep(NA, nrow(insp_comp))
insp_comp$inspection_description[insp_comp$inspection_type==984] <- "complete"
insp_comp$inspection_description[insp_comp$inspection_type==985] <- "lifted_cover"
insp_comp$inspection_description[insp_comp$inspection_type==986] <- "tilted_cover"
insp_comp$inspection_description[insp_comp$inspection_type==992] <- "visual"
insp_comp$inspection_type <- NULL

write.csv(insp_comp, wide_data, row.names = F)
######

