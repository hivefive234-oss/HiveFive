#############################
# options for main script

config_read_raw <- F

config_read_data <- F

config_preprocess <- F

config_check_preprocess <- F

config_read_event <- F

config_preprocess_event <- F

config_prepare_publication <- F

config_plot_event <- F

config_plot_event_single <- F

config_plot_year_single <- F

##############################

# years and events to consider

years <- c(2019, 2020, 2021, 2022)

config_events <- c("died", "swarming")

###################################

# sensors used
config_sensors <- c("t_i_1","t_i_2","t_i_3","t_i_4","t_i_5","t_o","weight_kg","h", "t","p")

# all covariates, including calculated values from sensor measurements

config_covariates <- c("t_i_1","t_i_2","t_i_3","t_i_4","t_i_5","t_o","weight_kg","h", "t","p", "weight_kg_noOutlier")

config_units <- c(rep("(°C)",6), rep("(kg)",1), "%", "(°C)", "hPa", rep("(kg)",1))

##################################
# files

# inspection dump to be used:
insp_data <- "data/dump_june_2023_rounded_coordinates.csv"


# file name for inspection data in wide format:
wide_data <- "data/wideJune23.csv"

# manual selection per year
info_dir <- "data/manual_select/"

# all information about manual selection
info_all_dir <- "data/all_info.csv"

####################################################
# keys and sensors 

# used to specify further deaths of colonies, if beekeepers only informed us via e-mail
# omitted for anonymisation


# used to specify further swarms, if beekeepers only informed us via e-mail
# omitted for anonymisation

# swarm not use
# omitted for anonymisation




#############################################################
# Preprocess options

# preprocess function to be used, e.g. in read_all
config_preprocess_functions <- c("add_missing_time_information",
                                 "filter_errors",
                                 #"impute_missing_values",
                                 "transform_weight_information",
                                 "merge_insp")

config_insp_labels  <- c("weisel", "feeding", "honey", "treatment", "died", "swarming") # "impression", "attention", "notes", 

########################

print_debug <- function(str){
  print(paste(Sys.time(), str))
}


#######################