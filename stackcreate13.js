{
  "Resources": {
      "ProjectXNodeSecurityGroup" : {
      "Type" : "AWS::EC2::SecurityGroup",
      "Properties" : {
        "GroupDescription" : "Enable SSH access and HTTP access on the inbound port",
        "SecurityGroupIngress" : 
          [ { "IpProtocol" : "tcp", "FromPort" : "22", "ToPort" : "22", "CidrIp" : "0.0.0.0/0" },
            { "IpProtocol" : "tcp", "FromPort" : "80", "ToPort" : "80", "CidrIp" : "0.0.0.0/0" }
          ]
      }
	  },
	 
	"CloudFormationASGroup" : {
    "Type": "AWS::AutoScaling::AutoScalingGroup",
      "Properties": {
        "AvailabilityZones": [
          "eu-west-1a"
        ],
        "Cooldown": "300",
        "DesiredCapacity": "2",
        "HealthCheckGracePeriod": "300",
        "HealthCheckType": "EC2",
        "MaxSize": "5",
        "MinSize": "1",
         "LaunchConfigurationName": {
          "Ref": "lcCloudwatchLoggingLaunceConfig"
        },
        "Tags": [
          {
            "Key": "Cwgroup",
            "Value": "Test",
            "PropagateAtLaunch": "true"
          }
        ],
        "TerminationPolicies": [
          "Default"
        ]
      }
    },
	
	
    "lcCloudwatchLoggingLaunceConfig": {
      "Type": "AWS::AutoScaling::LaunchConfiguration",
      "Properties": {
        "ImageId": "ami-fa411789",
        "InstanceType": "t2.micro",
        "KeyName": "cloudwatch",
        "IamInstanceProfile": "cli-cloudwatch",
        "SecurityGroups" : [{ "Ref" : "ProjectXNodeSecurityGroup" }],
        "BlockDeviceMappings": [
          {
            "DeviceName": "/dev/xvda",
            "Ebs": {
              "VolumeSize": 8
            }
          }
        ]
      }
    },
"scalingHIGHCPU" : {
  "Type" : "AWS::AutoScaling::ScalingPolicy",
  "Properties" : {
    "AdjustmentType" : "ChangeInCapacity",
    "AutoScalingGroupName" : { "Ref" : "CloudFormationASGroup" },
    "PolicyType" : "StepScaling",
    "MetricAggregationType" : "Average",
    "EstimatedInstanceWarmup" : "60",
    "StepAdjustments": [
      {
        "MetricIntervalLowerBound": "0",
        "MetricIntervalUpperBound" : "50",
        "ScalingAdjustment": "1"
      },
      {
        "MetricIntervalLowerBound": "50",
        "ScalingAdjustment": "2"
      }
    ]
  }
},

"scalingHIGHRAM" : {
  "Type" : "AWS::AutoScaling::ScalingPolicy",
  "Properties" : {
    "AdjustmentType" : "ChangeInCapacity",
    "AutoScalingGroupName" : { "Ref" : "CloudFormationASGroup" },
    "PolicyType" : "StepScaling",
    "MetricAggregationType" : "Average",
    "EstimatedInstanceWarmup" : "60",
    "StepAdjustments": [
      {
        "MetricIntervalLowerBound": "0",
        "MetricIntervalUpperBound" : "50",
        "ScalingAdjustment": "1"
      },
      {
        "MetricIntervalLowerBound": "50",
        "ScalingAdjustment": "2"
      }
    ]
  }
},


"scalingHIGHNW" : {
  "Type" : "AWS::AutoScaling::ScalingPolicy",
  "Properties" : {
    "AdjustmentType" : "ChangeInCapacity",
    "AutoScalingGroupName" : { "Ref" : "CloudFormationASGroup" },
    "PolicyType" : "StepScaling",
    "MetricAggregationType" : "Average",
    "EstimatedInstanceWarmup" : "60",
    "StepAdjustments": [
      {
        "MetricIntervalLowerBound": "0",
        "MetricIntervalUpperBound" : "50000000.0",
        "ScalingAdjustment": "1"
      },
      {
        "MetricIntervalLowerBound": "50000000.0",
        "ScalingAdjustment": "2"
      }
    ]
  }
},
    "alarmHIGHCPUASGROUP": {
      "Type": "AWS::CloudWatch::Alarm",
      "Properties": {
        "ActionsEnabled": "true",
        "ComparisonOperator": "GreaterThanOrEqualToThreshold",
        "EvaluationPeriods": "1",
        "MetricName": "CPUUtilization",
        "Namespace": "AWS/EC2",
        "Period": "300",
        "Statistic": "Average",
        "Threshold": "50.0",
        "AlarmActions": [
          {
            "Ref": "scalingHIGHCPU"
          },
          "arn:aws:sns:eu-west-1:339623878616:Notify"
        ],
        "Dimensions": [
          {
            "Name": "AutoScalingGroupName",
          }
        ]
      }
    },
    "alarmHIGHNWASGROUP": {
      "Type": "AWS::CloudWatch::Alarm",
      "Properties": {
        "ActionsEnabled": "true",
        "ComparisonOperator": "GreaterThanOrEqualToThreshold",
        "EvaluationPeriods": "1",
        "MetricName": "NetworkIn",
        "Namespace": "AWS/EC2",
        "Period": "300",
        "Statistic": "Average",
        "Threshold": "50000000.0",
        "AlarmActions": [
          {
            "Ref": "scalingHIGHNW"
          },
          "arn:aws:sns:eu-west-1:339623878616:Notify"
        ],
        "Dimensions": [
          {
            "Name": "AutoScalingGroupName",
          }
        ]
      }
    },
    "alarmHIGHRAMASGROUP": {
      "Type": "AWS::CloudWatch::Alarm",
      "Properties": {
        "ActionsEnabled": "true",
        "ComparisonOperator": "GreaterThanOrEqualToThreshold",
        "EvaluationPeriods": "1",
        "MetricName": "MemoryUtilization",
        "Namespace": "System/Linux",
        "Period": "300",
        "Statistic": "Average",
        "Threshold": "50.0",
        "AlarmActions": [
          "arn:aws:sns:eu-west-1:339623878616:Notify",
          {
            "Ref": "scalingHIGHRAM"
          }
        ],
        "Dimensions": [
          {
            "Name": "AutoScalingGroupName",
          }
        ]
      }
    }
}
}