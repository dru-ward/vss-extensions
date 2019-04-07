var config = {
	grid: {
		instance: null,
		dataSource: [],
		container: $("#grid-container"),
		options: {
			height: "1000px",
			columns: [
				{ text: "Project Name", index: "projectName", width: 150 },
				{ text: "Title", index: "title", width: 150 },
				{ text: "Created By", index: "createdBy", width: 150 },
				{ text: "Created Date", index: "createdDate", width: 150 },
				{ text: "Source", index: "sourceBranch", width: 150 },
				{ text: "Target", index: "targetBranch", width: 150 },
			],
		},
	},
};

config.displayData = function(){
	VSS.require(["VSS/Controls", "VSS/Controls/Grids", "VSS/Service", "TFS/Core/RestClient", "TFS/VersionControl/GitRestClient"],
	function (Controls, Grids, VSS_Service, Core_Client, Git_Client) {
	
		var gitClient = VSS_Service.getCollectionClient(Git_Client.GitHttpClient);
		var coreClient = VSS_Service.getCollectionClient(Core_Client.CoreHttpClient);

		coreClient.getProjects().then(function(projects){
			if(projects !== undefined && projects.length > 0) {
				jQuery.each(projects, function (index, project) {
					gitClient.getPullRequestsByProject(project.name).then(function(pullRequests){
						if(pullRequests !== undefined && pullRequests.length > 0) {
							jQuery.each(pullRequests, function (index, pullRequest) {
								config.grid.dataSource.push({
									projectName: project.name,
									title: pullRequest.title,
									createdBy: pullRequest.createdBy.displayName,
									createdDate: pullRequest.creationDate,
									sourceBranch: pullRequest.sourceRefName.replace('refs/heads/', ''),
									targetBranch: pullRequest.targetRefName.replace('refs/heads/', ''),
							 	});
								 
							 	config.grid.instance.setDataSource(config.grid.dataSource);
							}); 
						}
					});
				});
			}
		})
		.finally(function(){
			//nothing
		}).catch(function(error) {
			console.error(error);
		});

		VSS.notifyLoadSucceeded();
	});

};


VSS.init({
    usePlatformScripts: true, 
    usePlatformStyles: true
});

VSS.ready(function() {

	//init table.
	VSS.require(["VSS/Controls", "VSS/Controls/Grids"],
	function (Controls, Grids, VSS_Service, Core_Client, Git_Client) {
		config.grid.dataSource = [];
		config.grid.instance = Controls.create(Grids.Grid, config.grid.container, config.grid.options);
	});

	//request first payload.
	config.displayData();

	//every 30 seconds refresh table.
});

