source("tools/summarySE.R")

plot_key <- function(df, key, year, variables=config_sensors, folder="raw", 
                     x="time", timestamp="", ylabs=variables, xlabs=x, use_breaks=F, breaks=c(-48,-24,0,24,48)){

  if(nrow(df)>0){
    df$time <- as.POSIXct(df$time)
    for(i in 1:length(variables)){
      try({
      dir.create(file.path("plots", year))
      dir.create(file.path("plots", year, folder))
      png(paste("plots/", year, "/", folder, "/", key, "_", timestamp, "_", variables[i], ".png", sep = ""), width=600, height=300)
      plot <- ggplot(df,                            
                     aes_string(x = x,
                                y = variables[i],
                                group = 1
                     )) +
        geom_line(size=0.4)+
        ylab(ylabs[i])+
        xlab(xlabs)+
        theme(text = element_text(size=20))+
        geom_point()
      #scale_x_date(date_breaks = "3 month")
      if(use_breaks){
        plot <- plot + scale_x_continuous(breaks = breaks)
      }
      print(plot)
      dev.off()
      })
    } 
  }
}



plot_multiple_timeseries_groups_ribbon <- function(df, name){
  library(viridis)
  # plot mean and standard deviation for each group,
  # creates one plot per variable
  #
  # Parameters:
  # df: the data frame
  # name: used for the filename of each plot
  
  variables <- c("t_i_1","t_i_2","t_i_3","t_i_4","t_i_5","t_o",
                 "weight_kg", "weight_kg_noOffset_noOutlier", "weight_delta", "weight_delta_day", "weight_delta_noOutlier",
                 "h", "p", "t_diff_1", "t_diff_2", "t",
                 "t_cor_1", "t_cor_2")
  units <- c(rep("(°C)",6), rep("(kg)",4), "%", "", rep("(°C)",2))
  for(i in 1:length(variables)){
    sumy <- summarySE(df, measurevar=variables[i], groupvars=c("uni_time", "group"), na.rm = T)
    sumy$uni_time <- as.POSIXct(sumy$uni_time)
    sumy <- sumy[!is.na(sumy$mean),]
    # sumy$uni_time <- (sumy$uni_time-max(sumy$uni_time))/(24*7)
    png(paste("plots/exploratory/ribbon/", name, "_", variables[i], ".png", sep = ""), width=600, height=300)
    plot <- ggplot(sumy,                            
                   aes(x = uni_time,
                       y = mean,
                       ymin= mean - sd, 
                       ymax= mean + sd, 
                       fill = group,
                       linetype = group
                   )) +
      geom_line(size=0.5) +
      #  scale_fill_viridis(discrete = TRUE, option = "D", begin=0.2, direction = -1)+
      geom_ribbon(alpha=0.3)+ ###############
    theme(text = element_text(size=20))
    #   geom_vline(xintercept=0, linetype = "dashed")+
    #    labs(x="Time (Distance to event in days)", y=paste(variables[i], units[i]))
    
    print(plot)
    dev.off()
  }
  
}


plot_events_sub_ribbon <- function(df, name, variables = config_covariates, units = config_units){
  library(arules)
  df <- df[df$time_dist_event<=60*60*24*30&df$time_dist_event>=-60*60*24*10,]
  df$time_dist_event <- discretize(df$time_dist_event, breaks=40, labels=seq(-30,9,1))
  df$time_dist_event <- as.numeric(as.character(df$time_dist_event))

  for(i in 1:length(variables)){
    sumy <- summarySE(df, measurevar=variables[i], groupvars=c("time_dist_event", "group"), na.rm = T)
    png(paste("plots/exploratory/ribbonSub/", name, "_", variables[i], ".png", sep = ""), width=600, height=300)
    plot <- ggplot(sumy,                            
                   aes(x = time_dist_event,
                       y = mean,
                       ymin= mean - sd, 
                       ymax= mean + sd,
                       fill = group,
                       linetype = group
                   )) +
      geom_line(size=0.1) +
      geom_vline(xintercept=0, linetype = "dashed")+
      geom_ribbon(alpha=0.5) +
      scale_x_continuous(breaks = seq(-24,24,6))+
      theme(text = element_text(size=20))+
      labs(x="Time (Distance to event in hours)", y=paste(variables[i], units[i]))
    
    print(plot)
    dev.off()
  }
  
}
