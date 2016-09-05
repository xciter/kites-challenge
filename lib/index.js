
/*******************************************************************************
 *
 * A blank reference implementation exists below. Replace it with your
 * implementation.
 *
 *                                                                        [n=80]
 ******************************************************************************/

module.exports = (function() {
  "use strict";

  var hours = {}


  hours.parse = function(text) {
    var open_days = [];
    open_days = find_hours(text);
    return generate_result(open_days);
  }

  function find_hours(text) {
    var pattern = /(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\S*\s*(to|-)\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\D*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)|(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\S*\s*(to|-)\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)|(Mon|Tue|Wed|Thu|Fri|Sat|Sun))\D*(?:(\d+:\d{2})\s*(?:-|to)\s*(\d+:\d{2})|(\d{4})\s*(?:-|to)\s*(\d{4}))\W*(?:(\d+:\d{2})\s*(?:-|to)\s*(\d+:\d{2})|(\d{4}\s*)(?:-|to)(\d{4}))*/g;
    var extracted_info = [];
    var match;
    while (match = pattern.exec(text)){
      extracted_info.push(extract_hours(match));
    }
    return extracted_info;
  }

  function extract_hours(item) {
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var open_days = [];
    var has_day_range = false;
    var start_day = -1;
    var end_day = -1;
    var more_days = [];
    var hour_ranges = [];

    item = item.filter(function(n){ return n != undefined });

    for (var idx = 0; idx < item.length; ++idx) {
      if (days.indexOf(item[idx]) != -1) {
        if (start_day == -1) {
          start_day = days.indexOf(item[idx]);
        }
        else if (has_day_range && end_day == -1) {
          end_day = days.indexOf(item[idx]);
        }
        else if (end_day != -1) {
          more_days.push(days.indexOf(item[idx]));
        }
      }

      else if (["to", "-"].indexOf(item[idx]) != -1) {
        has_day_range = true;
      }

      else if (!isNaN(item[idx].replace(":", ""))) {
        var value = item[idx].replace(":", "");
        if (value.length == 3) value = "0" + value;
        hour_ranges.push(value);
      }

      if (end_day == 0 && start_day == 1) {
        end_day = 6;
        start_day = 0;
      }
    }

    open_days.push(generate_machine_output(start_day, end_day, more_days, hour_ranges));

    return open_days;
  }

  function generate_machine_output(start, finish, additional_days, hour_ranges){
    var output = "";

    output += start;

    if (finish != -1)
      output += '-' + finish;

    if (additional_days.length != 0){
      for (var idx=0; idx<additional_days.length; ++idx) {
        var day = additional_days[idx];
        if (day-start == -1){
          output = output.replace(start, day);
          start = day;
        }
        else if (day-finish == 1){
          output = output.replace(finish, day);
          finish = day;
        }
        else if (day < start){
          output = day + ',' + output;
        }

        else if (day > finish){
          output += ',' + finish;
        }
      }
    }

    output += ':';

    output += combine_hours(hour_ranges);

    return output;
  }

  function combine_hours(hour_array) {
    var hour_ranges = [];
    var output = "";
    for (var idx=0; idx<hour_array.length; idx+=2){
      var first = hour_array[idx];
      var second = hour_array[idx+1];
      if (second < first)
        second = (parseInt(second) + 2400).toString();
      hour_ranges.push([first, second]);
    }

    hour_ranges.sort();

    var start = hour_ranges[0][0];
    var finish = hour_ranges[0][1];

    for (var idx=0; idx<hour_ranges.length; ++idx) {
      if (hour_ranges[idx][0] <= finish) {
        if (hour_ranges[idx][1] > finish) {
          finish = hour_ranges[idx][1];
        }
      }
      else {
        output += start + '-' + finish + ',';
        start = hour_ranges[idx][0];
        finish = hour_ranges[idx][1];
      }
    }

    output += start + '-' + finish;
    return output;
  }

  function generate_result(open_days) {
    var output = 'S';
    open_days.sort();
    for (var idx=0; idx<open_days.length; ++idx){
      output += open_days[idx] + ';';
    }
    return output.slice(0, -1);
  }

  return hours

}());
