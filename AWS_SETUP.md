# AWS S3 Bucket Set Up Guide

To begin, you will need an AWS account, go to the [AWS Console](https://aws.amazon.com/console/) and sign in after creating your account if necassary.

## Bucket set up

- Use the "Find Services" search bar to search for "S3" and open it.
- Click "Create Bucket"
- Assign the bucket a name, it is recommended to name the bucket something relevant to the project it will be used for to allow you toe asily identify its purpose if you ever need to make changes to it in future.
- Select a region, it is recommended to use the region closest to you as this will improve performance.
- Uncheck "Block all public access". This will then give you a warning that all objects within the bucket will become publicly accessible. This is what we want, so tick the box to acknowledge the warning and continue.
- Click "Create Bucket"

## Bucket Configuration

### Properties

- In the properties tab enable static website hosting.
- Ensure the hosting type in "host a static website".
- For the index document enter "index.html".
- For the error document enter "error.html".
- Click "Save".

### Permissions

- Scroll down to find the CORS configuration.
- Enter the code below:

```
[
  {
      "AllowedHeaders": [
          "Authorization"
      ],
      "AllowedMethods": [
          "GET"
      ],
      "AllowedOrigins": [
          "*"
      ],
      "ExposeHeaders": []
  }
]
```

- Next find the Bucket Policy Section.
- Click "Edit" and use the Policy Generator.
- In the Policy Generator select the policy type "S3 Bucket Policy"
- Under "Add Statement(s)" select "Allow" for Effect.
- In Principal enter ```*``` 
- Under Action, Select "Get Object"
- Under "Amazon Resource Name (ARN)" enter the ARN of the bucket you created in the following format: ```arn:aws:s3:::<BucketName>/*``` - The ```/*``` at the end here is important. Make sure you have it included in yours.
- Click Add Statement
- Click Generate Policy
- Copy the policy and return to the S3 Bucket Policy editor
- Paste the policy into the editable area and click save.
- Finally find the "Access control list (ACL)" on this page and click "Edit"
- Ensure that "List" is ticked for "Everyone (public access)"

## IAM (Identity and Access Management)

Going back to the AWS Console, use the search functionality again to find the IAM service and click on it. We will need to create a Group, then add a user to that Group, then apply an access policy to allow members of that group to manage the bucket we created earlier.

### Create Group

- On the left side menu click "User Groups" under "Access management"
- Click "Create Group"
- Name your group something appropriate for the project for easy identification in future
- Click "Create Group"

### Create Policy

- Click "Policies" in the left side menu under "Access management"
- Click "Create Policy"
- Under "Service" select "S3"
- Find the "Actions" button and click "import policy"
- Choose "AmazonS3FullAccess" and click "Import policy" again.
- Select the JSON visualisor and edit the "Resource" value from ```*``` to ```<BucketARN>/*```
  - Where ```<BucketARN>``` is the ARN for your bucket.
- Click Next
- Give the policy a recognisable name (and description if you'd like).
- Click Create Policy.

### Add Policy to Group

Go back to User Groups in the left side menu and find the group you created earlier.

- Click on the "Permissions" tab
- Click "Add Permissions" and then "Attach Policies"
- Find the Policy you just created and tick the checkbox next to it before clicking "Attach Policies"

## Create User

Go to Users in the left side menu and click create user.

- Assign a name to the user and click "Next"
- On the next page tick the checkbox next to the usergroup we just created and click next to add this user to that group.
- Click "Create User"
- Click the user you just created from the list
- Go to the "Security Credentials" tab
- Under "Access Keys" click Create Access Key
- Select Application Running Outside of AWS
- Click Next
- Name the key and click next
- You will then be provided with the AWS Access Key and AWS Secret Access Key to use in your project
- You can download these keys as a .csv file for future reference as you can't access these keys again once you close this window.










